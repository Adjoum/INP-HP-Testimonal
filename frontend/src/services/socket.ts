import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connecté au serveur Socket.IO');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Déconnecté du serveur Socket.IO');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion Socket.IO:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Rejoindre une room de témoignage
  joinTestimonial(testimonialId: string): void {
    if (this.socket) {
      this.socket.emit('join-testimonial', testimonialId);
    }
  }

  // Quitter une room de témoignage
  leaveTestimonial(testimonialId: string): void {
    if (this.socket) {
      this.socket.emit('leave-testimonial', testimonialId);
    }
  }

  // Émettre un nouveau témoignage
  emitNewTestimonial(testimonial: any): void {
    if (this.socket) {
      this.socket.emit('new-testimonial', testimonial);
    }
  }

  // Émettre un like de témoignage
  emitTestimonialLike(data: any): void {
    if (this.socket) {
      this.socket.emit('testimonial-like', data);
    }
  }

  // Émettre un nouveau commentaire
  emitNewComment(comment: any): void {
    if (this.socket) {
      this.socket.emit('new-comment', comment);
    }
  }

  // Émettre un like de commentaire
  emitCommentLike(data: any): void {
    if (this.socket) {
      this.socket.emit('comment-like', data);
    }
  }

  // Émettre une suppression de témoignage
  emitDeleteTestimonial(data: any): void {
    if (this.socket) {
      this.socket.emit('delete-testimonial', data);
    }
  }

  // Émettre une suppression de commentaire
  emitDeleteComment(data: any): void {
    if (this.socket) {
      this.socket.emit('delete-comment', data);
    }
  }

  // Émettre que l'utilisateur est en train de taper
  emitTyping(testimonialId: string, userName: string): void {
    if (this.socket) {
      this.socket.emit('typing', { testimonialId, userName });
    }
  }

  // Émettre que l'utilisateur a arrêté de taper
  emitStopTyping(testimonialId: string, userName: string): void {
    if (this.socket) {
      this.socket.emit('stop-typing', { testimonialId, userName });
    }
  }

  // Écouter les nouveaux témoignages
  onNewTestimonial(callback: (testimonial: any) => void): void {
    if (this.socket) {
      this.socket.on('testimonial-created', callback);
    }
  }

  // Écouter les mises à jour de likes de témoignage
  onTestimonialLikeUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('testimonial-like-update', callback);
    }
  }

  // Écouter les nouveaux commentaires
  onNewComment(callback: (comment: any) => void): void {
    if (this.socket) {
      this.socket.on('comment-created', callback);
    }
  }

  // Écouter les mises à jour de likes de commentaire
  onCommentLikeUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('comment-like-update', callback);
    }
  }

  // Écouter les suppressions de témoignage
  onTestimonialDeleted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('testimonial-deleted', callback);
    }
  }

  // Écouter les suppressions de commentaire
  onCommentDeleted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('comment-deleted', callback);
    }
  }

  // Écouter les utilisateurs en train de taper
  onUserTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Écouter quand un utilisateur arrête de taper
  onUserStopTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  // Retirer tous les écouteurs
  offAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
