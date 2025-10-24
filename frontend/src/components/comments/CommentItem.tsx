import React, { useState } from 'react';
import { Heart, Reply, Trash2, Send, CheckCircle } from 'lucide-react';
import type { Comment as CommentType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: CommentType;
  testimonialId: string;
  onUpdate: () => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  testimonialId,
  onUpdate,
  depth = 0,
}) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localComment, setLocalComment] = useState(comment);

  const isAuthor = user?._id === comment.author._id;
  const maxDepth = 5; // Limiter la profondeur d'affichage des réponses

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousState = { ...localComment };

    // Mise à jour optimiste
    setLocalComment({
      ...localComment,
      likedByUser: !localComment.likedByUser,
      likesCount: localComment.likedByUser
        ? localComment.likesCount - 1
        : localComment.likesCount + 1,
    });

    try {
      const response = await api.post(`/comments/${comment._id}/like`);

      if (response.data.success) {
        // Émettre l'événement Socket.IO
        socketService.emitCommentLike({
          commentId: comment._id,
          testimonialId,
          likesCount: response.data.data.likesCount,
          likedByUser: response.data.data.likedByUser,
        });
      }
    } catch (error) {
      setLocalComment(previousState);
      toast.error('Erreur lors du like');
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (replyContent.trim().length < 1) return;

    setSubmitting(true);

    try {
      const response = await api.post('/comments', {
        testimonialId,
        parentCommentId: comment._id,
        content: replyContent,
      });

      if (response.data.success) {
        toast.success('Réponse ajoutée !');
        setReplyContent('');
        setShowReplyForm(false);

        // Émettre l'événement Socket.IO
        socketService.emitNewComment({
          ...response.data.data,
          testimonialId,
        });

        onUpdate();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erreur lors de l\'ajout de la réponse';
      toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await api.delete(`/comments/${comment._id}`);
      toast.success('Commentaire supprimé');

      // Émettre l'événement Socket.IO
      socketService.emitDeleteComment({
        commentId: comment._id,
        testimonialId,
      });

      onUpdate();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  return (
    <div
      className={`${
        depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''
      }`}
    >
      <div className="bg-gray-50 rounded-lg p-4">
        {/* En-tête du commentaire */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-800">
                  {comment.author.name}
                </span>
                {comment.author.verified && (
                  <CheckCircle className="w-3 h-3 text-inphb-green-500" />
                )}
              </div>
              <span className="text-xs text-gray-500">
                {comment.author.promotion}
              </span>
            </div>
          </div>

          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contenu du commentaire */}
        <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">
          {localComment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 ${
              localComment.likedByUser
                ? 'text-red-600'
                : 'text-gray-500 hover:text-red-600'
            } transition-colors`}
          >
            <Heart
              className={`w-4 h-4 ${
                localComment.likedByUser ? 'fill-current' : ''
              }`}
            />
            <span>{localComment.likesCount}</span>
          </button>

          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-500 hover:text-inphb-orange-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>Répondre</span>
            </button>
          )}

          {comment.repliesCount > 0 && (
            <span className="text-gray-500">
              {comment.repliesCount} réponse{comment.repliesCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
                maxLength={500}
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-inphb-orange-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={submitting || replyContent.trim().length < 1}
                className="px-4 py-2 bg-inphb-orange-500 text-white rounded-lg hover:bg-inphb-orange-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Réponses (récursif) */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              testimonialId={testimonialId}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;