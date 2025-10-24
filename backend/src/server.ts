import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
//import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import commentRoutes from './routes/commentRoutes';

// Charger les variables d'environnement
//dotenv.config({ path: "../.env" });
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}  


// Créer l'application Express
const app: Application = express();

// Créer le serveur HTTP
const httpServer = createServer(app);

// Configurer Socket.IO avec CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecter à la base de données
connectDB();

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/comments', commentRoutes);

// Route de test
app.get('/', (_req: Request, res: Response) => {  // ← Ajout du underscore ici
  res.json({
    message: '🎓 API INP-HB Stories',
    version: '1.0.0',
    status: 'running',
  });
});

// Gestion de Socket.IO pour le temps réel
io.on('connection', (socket) => {
  console.log('✅ Nouvel utilisateur connecté:', socket.id);

  // Rejoindre une "room" pour un témoignage spécifique
  socket.on('join-testimonial', (testimonialId: string) => {
    socket.join(`testimonial-${testimonialId}`);
    console.log(`🔗 Socket ${socket.id} a rejoint testimonial-${testimonialId}`);
  });

  // Quitter une "room"
  socket.on('leave-testimonial', (testimonialId: string) => {
    socket.leave(`testimonial-${testimonialId}`);
    console.log(`🔌 Socket ${socket.id} a quitté testimonial-${testimonialId}`);
  });

  // Nouveau témoignage créé
  socket.on('new-testimonial', (data) => {
    io.emit('testimonial-created', data);
    console.log('📢 Nouveau témoignage diffusé:', data._id);
  });

  // Like/Unlike sur un témoignage
  socket.on('testimonial-like', (data) => {
    io.to(`testimonial-${data.testimonialId}`).emit('testimonial-like-update', data);
    console.log('❤️ Like mis à jour:', data);
  });

  // Nouveau commentaire
  socket.on('new-comment', (data) => {
    io.to(`testimonial-${data.testimonialId}`).emit('comment-created', data);
    console.log('💬 Nouveau commentaire diffusé:', data);
  });

  // Like/Unlike sur un commentaire
  socket.on('comment-like', (data) => {
    io.to(`testimonial-${data.testimonialId}`).emit('comment-like-update', data);
    console.log('❤️ Like commentaire mis à jour:', data);
  });

  // Suppression d'un témoignage
  socket.on('delete-testimonial', (data) => {
    io.emit('testimonial-deleted', data);
    console.log('🗑️ Témoignage supprimé:', data);
  });

  // Suppression d'un commentaire
  socket.on('delete-comment', (data) => {
    io.to(`testimonial-${data.testimonialId}`).emit('comment-deleted', data);
    console.log('🗑️ Commentaire supprimé:', data);
  });

  // Utilisateur en train de taper
  socket.on('typing', (data) => {
    socket.to(`testimonial-${data.testimonialId}`).emit('user-typing', data);
  });

  // Utilisateur a arrêté de taper
  socket.on('stop-typing', (data) => {
    socket.to(`testimonial-${data.testimonialId}`).emit('user-stop-typing', data);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('❌ Utilisateur déconnecté:', socket.id);
  });
});

// Middleware de gestion d'erreurs
app.use((err: any, _req: Request, res: Response, _next: any) => {  // ← Ajout des underscores ici
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO prêt pour les connexions temps réel`);
});

export { io };














// import express, { Application, Request, Response } from 'express';
// import { createServer } from 'http';
// import { Server as SocketIOServer } from 'socket.io';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/database';
// import authRoutes from './routes/authRoutes';
// import testimonialRoutes from './routes/testimonialRoutes';
// import commentRoutes from './routes/commentRoutes';

// // Charger les variables d'environnement
// dotenv.config({ path: "../.env.example" });

// // Créer l'application Express
// const app: Application = express();

// // Créer le serveur HTTP
// const httpServer = createServer(app);

// // Configurer Socket.IO avec CORS
// const io = new SocketIOServer(httpServer, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Connecter à la base de données
// connectDB();

// // Routes API
// app.use('/api/auth', authRoutes);
// app.use('/api/testimonials', testimonialRoutes);
// app.use('/api/comments', commentRoutes);

// // Route de test
// app.get('/', (req: Request, res: Response) => {
//   res.json({
//     message: '🎓 API INP-HB Stories',
//     version: '1.0.0',
//     status: 'running',
//   });
// });

// // Gestion de Socket.IO pour le temps réel
// io.on('connection', (socket) => {
//   console.log('✅ Nouvel utilisateur connecté:', socket.id);

//   // Rejoindre une "room" pour un témoignage spécifique
//   socket.on('join-testimonial', (testimonialId: string) => {
//     socket.join(`testimonial-${testimonialId}`);
//     console.log(`🔗 Socket ${socket.id} a rejoint testimonial-${testimonialId}`);
//   });

//   // Quitter une "room"
//   socket.on('leave-testimonial', (testimonialId: string) => {
//     socket.leave(`testimonial-${testimonialId}`);
//     console.log(`🔌 Socket ${socket.id} a quitté testimonial-${testimonialId}`);
//   });

//   // Nouveau témoignage créé
//   socket.on('new-testimonial', (data) => {
//     io.emit('testimonial-created', data);
//     console.log('📢 Nouveau témoignage diffusé:', data._id);
//   });

//   // Like/Unlike sur un témoignage
//   socket.on('testimonial-like', (data) => {
//     io.to(`testimonial-${data.testimonialId}`).emit('testimonial-like-update', data);
//     console.log('❤️ Like mis à jour:', data);
//   });

//   // Nouveau commentaire
//   socket.on('new-comment', (data) => {
//     io.to(`testimonial-${data.testimonialId}`).emit('comment-created', data);
//     console.log('💬 Nouveau commentaire diffusé:', data);
//   });

//   // Like/Unlike sur un commentaire
//   socket.on('comment-like', (data) => {
//     io.to(`testimonial-${data.testimonialId}`).emit('comment-like-update', data);
//     console.log('❤️ Like commentaire mis à jour:', data);
//   });

//   // Suppression d'un témoignage
//   socket.on('delete-testimonial', (data) => {
//     io.emit('testimonial-deleted', data);
//     console.log('🗑️ Témoignage supprimé:', data);
//   });

//   // Suppression d'un commentaire
//   socket.on('delete-comment', (data) => {
//     io.to(`testimonial-${data.testimonialId}`).emit('comment-deleted', data);
//     console.log('🗑️ Commentaire supprimé:', data);
//   });

//   // Utilisateur en train de taper
//   socket.on('typing', (data) => {
//     socket.to(`testimonial-${data.testimonialId}`).emit('user-typing', data);
//   });

//   // Utilisateur a arrêté de taper
//   socket.on('stop-typing', (data) => {
//     socket.to(`testimonial-${data.testimonialId}`).emit('user-stop-typing', data);
//   });

//   // Déconnexion
//   socket.on('disconnect', () => {
//     console.log('❌ Utilisateur déconnecté:', socket.id);
//   });
// });

// // Middleware de gestion d'erreurs
// app.use((err: any, req: Request, res: Response, next: any) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Erreur serveur',
//   });
// });

// // Démarrer le serveur
// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, () => {
//   console.log(`🚀 Serveur démarré sur le port ${PORT}`);
//   console.log(`📡 Socket.IO prêt pour les connexions temps réel`);
// });

// export { io };
