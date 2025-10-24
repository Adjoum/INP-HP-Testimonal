import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2, Clock, CheckCircle } from 'lucide-react';
import type { Testimonial } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';
import CommentSection from '../comments/CommentSection';

interface TestimonialCardProps {
  testimonial: Testimonial;
  onUpdate: () => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localTestimonial, setLocalTestimonial] = useState(testimonial);

  const isAuthor = user?._id === testimonial.author._id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousState = { ...localTestimonial };

    // Mise à jour optimiste
    setLocalTestimonial({
      ...localTestimonial,
      likedByUser: !localTestimonial.likedByUser,
      likesCount: localTestimonial.likedByUser
        ? localTestimonial.likesCount - 1
        : localTestimonial.likesCount + 1,
    });

    try {
      const response = await api.post(`/testimonials/${testimonial._id}/like`);
      
      if (response.data.success) {
        // Émettre l'événement Socket.IO
        socketService.emitTestimonialLike({
          testimonialId: testimonial._id,
          likesCount: response.data.data.likesCount,
          likedByUser: response.data.data.likedByUser,
        });
      }
    } catch (error) {
      // Restaurer l'état précédent en cas d'erreur
      setLocalTestimonial(previousState);
      toast.error('Erreur lors du like');
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    try {
      await api.delete(`/testimonials/${testimonial._id}`);
      toast.success('Témoignage supprimé');
      
      // Émettre l'événement Socket.IO
      socketService.emitDeleteTestimonial({ testimonialId: testimonial._id });
      
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 card-hover animate-fade-in">
      {/* En-tête avec auteur */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.author.avatar}
            alt={testimonial.author.name}
            className="w-12 h-12 rounded-full border-2 border-inphb-orange-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">
                {testimonial.author.name}
              </h3>
              {testimonial.author.verified && (
                <CheckCircle className="w-4 h-4 text-inphb-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {testimonial.author.promotion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatDate(testimonial.createdAt)}</span>
        </div>
      </div>

      {/* Contenu du témoignage */}
      <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
        {localTestimonial.content}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              localTestimonial.likedByUser
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                localTestimonial.likedByUser ? 'fill-current' : ''
              }`}
            />
            <span className="font-semibold">{localTestimonial.likesCount}</span>
          </button>

          {/* Commentaires */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{localTestimonial.commentsCount}</span>
          </button>
        </div>

        {/* Bouton Supprimer (si auteur) */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Supprimer</span>
          </button>
        )}
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <CommentSection testimonialId={testimonial._id} />
        </div>
      )}
    </div>
  );
};

export default TestimonialCard;