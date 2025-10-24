import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { Testimonial } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface CreateTestimonialProps {
  onClose: () => void;
  onSuccess: (testimonial: Testimonial) => void;
}

const CreateTestimonial: React.FC<CreateTestimonialProps> = ({
  onClose,
  onSuccess,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length < 10) {
      toast.error('Le témoignage doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/testimonials', { content });

      if (response.data.success) {
        toast.success('Témoignage publié ! 🎉');
        onSuccess(response.data.data);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erreur lors de la publication';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full animate-slide-up">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Partager mon histoire
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre expérience à l'INP-HB, vos conseils, vos souvenirs... (minimum 10 caractères)"
              rows={8}
              maxLength={1000}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inphb-orange-500 focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <p className="text-gray-500">
                {content.length < 10 ? (
                  <span className="text-red-500">
                    Encore {10 - content.length} caractères minimum
                  </span>
                ) : (
                  <span className="text-green-600">✓ Longueur valide</span>
                )}
              </p>
              <p className="text-gray-400">{content.length} / 1000</p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Publication...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestimonial;