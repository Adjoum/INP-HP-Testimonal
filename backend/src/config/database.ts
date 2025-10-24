import mongoose from 'mongoose';
//import dotenv from 'dotenv';

// Charger les variables d'environnement
//dotenv.config({ path: "../.env" });
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} 

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connecté avec succès');
    
    // Événements de connexion
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erreur de connexion MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB déconnecté');
    });

    // Fermer proprement la connexion lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB déconnecté suite à l\'arrêt de l\'application');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
