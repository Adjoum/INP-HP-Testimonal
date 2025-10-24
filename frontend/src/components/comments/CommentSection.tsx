import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { Comment as CommentType } from '../../types';
import api from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  testimonialId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ testimonialId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Charger les commentaires
  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/testimonial/${testimonialId}`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();

    // Rejoindre la room du témoignage
    socketService.joinTestimonial(testimonialId);

    // Écouter les nouveaux commentaires
    socketService.onNewComment((comment) => {
      if (comment.testimonialId === testimonialId) {
        loadComments(); // Recharger pour obtenir la structure complète
      }
    });

    socketService.onCommentDeleted((data) => {
      if (data.testimonialId === testimonialId) {
        loadComments();
      }
    });

    socketService.onCommentLikeUpdate((data) => {
      if (data.testimonialId === testimonialId) {
        // Mettre à jour le like du commentaire
        const updateCommentLikes = (comments: CommentType[]): CommentType[] => {
          return comments.map((comment) => {
            if (comment._id === data.commentId) {
              return {
                ...comment,
                likesCount: data.likesCount,
                likedByUser: data.likedByUser,
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentLikes(comment.replies),
              };
            }
            return comment;
          });
        };

        setComments((prev) => updateCommentLikes(prev));
      }
    });

    return () => {
      socketService.leaveTestimonial(testimonialId);
    };
  }, [testimonialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newComment.trim().length < 1) return;

    setSubmitting(true);

    try {
      const response = await api.post('/comments', {
        testimonialId,
        content: newComment,
      });

      if (response.data.success) {
        setNewComment('');
        
        // Émettre l'événement Socket.IO
        socketService.emitNewComment({
          ...response.data.data,
          testimonialId,
        });

        // Recharger les commentaires
        loadComments();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
      toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Commentaires ({comments.length})
      </h3>

      {/* Formulaire d'ajout de commentaire */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            maxLength={500}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inphb-orange-500 focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={submitting || newComment.trim().length < 1}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Liste des commentaires */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-inphb-orange-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Aucun commentaire. Soyez le premier à commenter ! 💬
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              testimonialId={testimonialId}
              onUpdate={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
