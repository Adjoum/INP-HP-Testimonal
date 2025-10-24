import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Clock, MessageCircle, Search } from 'lucide-react';
import type { Testimonial, SortOption } from '../types';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import TestimonialCard from './testimonials/TestimonialCard';
import CreateTestimonial from './testimonials/CreateTestimonial';

const Home: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les témoignages
  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/testimonials', {
        params: {
          sort: sortBy,
          search: searchQuery,
          limit: 50,
        },
      });

      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des témoignages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [sortBy, searchQuery]);

  // Écouter les nouveaux témoignages en temps réel
  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      socketService.onNewTestimonial((newTestimonial) => {
        setTestimonials((prev) => [newTestimonial, ...prev]);
        toast.success('Nouveau témoignage ! 🎉');
      });

      socketService.onTestimonialDeleted((data) => {
        setTestimonials((prev) =>
          prev.filter((t) => t._id !== data.testimonialId)
        );
      });

      socketService.onTestimonialLikeUpdate((data) => {
        setTestimonials((prev) =>
          prev.map((t) =>
            t._id === data.testimonialId
              ? { ...t, likesCount: data.likesCount, likedByUser: data.likedByUser }
              : t
          )
        );
      });
    }

    return () => {
      socketService.offAllListeners();
    };
  }, []);

  const handleTestimonialCreated = (newTestimonial: Testimonial) => {
    setTestimonials((prev) => [newTestimonial, ...prev]);
    setShowCreateModal(false);
    
    // Émettre l'événement Socket.IO
    socketService.emitNewTestimonial(newTestimonial);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête avec filtres */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Témoignages des étudiants
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Partager mon histoire
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un témoignage..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inphb-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filtres de tri */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              sortBy === 'recent'
                ? 'bg-inphb-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Récents
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              sortBy === 'popular'
                ? 'bg-inphb-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Populaires
          </button>
          <button
            onClick={() => setSortBy('commented')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              sortBy === 'commented'
                ? 'bg-inphb-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Plus commentés
          </button>
        </div>
      </div>

      {/* Liste des témoignages */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-inphb-orange-500"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun témoignage trouvé. Soyez le premier à partager ! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              onUpdate={loadTestimonials}
            />
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateTestimonial
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTestimonialCreated}
        />
      )}
    </div>
  );
};

export default Home;
