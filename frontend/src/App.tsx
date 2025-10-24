import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import socketService from './services/socket';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import Header from './components/common/Header';
import LandingPage from './components/LandingPage';

type Page = 'landing' | 'home' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing'); // useState<Page>('home');

  useEffect(() => {
    // Connecter Socket.IO si l'utilisateur est connecté
    if (user) {
      const socket = socketService.connect();
      console.log('✅ Socket.IO connecté');
      setCurrentPage('home'); //
      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-inphb-orange-50 to-inphb-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-inphb-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Landing page pour les visiteurs non connectés
  if (currentPage === 'landing' && !user) {
    return <LandingPage onGetStarted={() => setCurrentPage('register')} />;
  }

  // Si l'utilisateur n'est pas connecté, afficher Login ou Register
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-inphb-orange-50 via-white to-inphb-green-50">
        {currentPage === 'login' ? (
          <Login onSwitchToRegister={() => setCurrentPage('register')} />
        ) : (
          <Register onSwitchToLogin={() => setCurrentPage('login')} />
        )}
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher l'application principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-inphb-orange-50">
      <Header />
      <Home />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
