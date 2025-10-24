import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRight, Users, Heart, MessageCircle, Sparkles, 
  GraduationCap, Building2, Star, Sun, Moon, Monitor,
  Zap, TrendingUp, Award, Globe
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

type Theme = 'light' | 'dark' | 'system';

interface CursorTrail {
  x: number;
  y: number;
  id: number;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState<CursorTrail[]>([]);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const trailIdRef = useRef(0);
  
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Theme management - CORRIGÉ
  useEffect(() => {
    const applyTheme = () => {
      let newTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newTheme = theme as 'light' | 'dark';
      }
      
      setActualTheme(newTheme);
      
      // Appliquer la classe dark à l'élément HTML
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Écouter les changements de thème système
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Snake cursor effect - AMÉLIORÉ
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMousePosition(newPos);
      setIsMouseMoving(true);

      // Ajouter un nouveau point à la traînée
      setCursorTrail(prev => {
        const newTrail = [
          { x: e.clientX, y: e.clientY, id: trailIdRef.current++ },
          ...prev
        ].slice(0, 20); // Garder seulement 20 points max
        return newTrail;
      });

      // Réinitialiser le timeout
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }

      // Marquer la souris comme statique après 150ms sans mouvement
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
        // Effacer progressivement la traînée
        setCursorTrail([]);
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  // Nettoyer les anciens points de la traînée
  useEffect(() => {
    if (!isMouseMoving) return;

    const interval = setInterval(() => {
      setCursorTrail(prev => {
        if (prev.length === 0) return prev;
        return prev.slice(0, -1); // Retirer le dernier point
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isMouseMoving]);

  // Theme toggle component - CORRIGÉ
  const ThemeToggle = () => {
    const themes: Array<{ value: Theme; icon: React.ReactNode; label: string }> = [
      { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Clair' },
      { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Sombre' },
      { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Système' },
    ];

    return (
      <motion.div 
        className="fixed top-6 right-6 z-50 flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {themes.map((t) => (
          <motion.button
            key={t.value}
            onClick={() => {
              console.log('Changement de thème:', t.value);
              setTheme(t.value);
            }}
            className={`relative p-2.5 rounded-full transition-all ${
              theme === t.value
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={t.label}
          >
            {theme === t.value && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.icon}</span>
          </motion.button>
        ))}
      </motion.div>
    );
  };

  // Enhanced animated background with particles
  const AnimatedParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => i);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-500/30 dark:bg-orange-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  };

  // Floating shapes with gradient
  const FloatingShape = ({ delay = 0, size = 'lg', position = { top: '20%', left: '10%' } }) => (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br from-orange-400/20 to-green-400/20 dark:from-orange-500/10 dark:to-green-500/10 blur-3xl pointer-events-none
        ${size === 'lg' ? 'w-96 h-96' : size === 'md' ? 'w-64 h-64' : 'w-48 h-48'}`}
      style={position}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.2, 0.9, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 25,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Snake cursor with trail - NOUVEAU
  const SnakeCursor = () => (
    <>
      {/* Traînée du serpent */}
      <AnimatePresence>
        {isMouseMoving && cursorTrail.map((point, index) => {
          const opacity = (cursorTrail.length - index) / cursorTrail.length;
          const scale = 0.3 + (opacity * 0.7);
          
          return (
            <motion.div
              key={point.id}
              className="fixed pointer-events-none z-40"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: opacity * 0.8,
                scale: scale,
                x: point.x - 12,
                y: point.y - 12,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-green-500 blur-sm"
                style={{
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)',
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Curseur principal */}
      <motion.div
        className="fixed w-12 h-12 pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="relative w-full h-full">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 rounded-full blur-lg"
            animate={{
              opacity: isMouseMoving ? [0.3, 0.6, 0.3] : 0.2,
              scale: isMouseMoving ? [1, 1.2, 1] : 0.8,
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full" />
          <div className="absolute inset-4 bg-gradient-to-r from-orange-500 to-green-500 rounded-full" />
        </div>
      </motion.div>
    </>
  );

  // Stats counter with enhanced animation
  const AnimatedCounter = ({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) => {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

    useEffect(() => {
      if (inView) {
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, [inView, value]);

    return (
      <motion.div 
        ref={ref} 
        className="relative group"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-green-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
            {icon}
          </div>
          <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600 dark:from-orange-400 dark:to-green-400">
            {count}+
          </div>
          <div className="text-gray-600 dark:text-gray-300 mt-3 text-lg">{label}</div>
        </div>
      </motion.div>
    );
  };

  // Animated text reveal
  const AnimatedText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
    const letters = children.split('');
    
    return (
      <span>
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + i * 0.03 }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <ThemeToggle />
      <SnakeCursor />
      <AnimatedParticles />

      {/* Enhanced animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape delay={0} size="lg" position={{ top: '10%', left: '5%' }} />
        <FloatingShape delay={5} size="md" position={{ top: '60%', right: '10%' }} />
        <FloatingShape delay={10} size="sm" position={{ bottom: '20%', left: '40%' }} />
        <FloatingShape delay={3} size="lg" position={{ top: '40%', right: '5%' }} />
        <FloatingShape delay={8} size="md" position={{ bottom: '10%', left: '15%' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          style={{ opacity, scale }}
        >
          {/* Enhanced Logo Animation with 3D effect */}
          <motion.div
            className="mb-12 flex justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <motion.div 
              className="relative w-40 h-40"
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-green-500 rounded-full blur-2xl animate-pulse" />
              <motion.div 
                className="relative bg-white dark:bg-gray-800 rounded-full w-full h-full flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GraduationCap className="w-20 h-20 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600" style={{ fill: 'url(#grad)' }} />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Title with gradient animation */}
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-green-600 dark:from-orange-400 dark:via-red-400 dark:to-green-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              <AnimatedText delay={0.2}>INP-HB Stories</AnimatedText>
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-12"
          >
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-semibold max-w-4xl mx-auto">
              Découvrez les parcours <span className="text-orange-600 dark:text-orange-400">inspirants</span> des diplômés de l'INP-HB
            </p>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                Partagez votre histoire, inspirez la nouvelle génération
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </span>
            </motion.p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-green-500 text-white rounded-full text-xl font-bold overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(234, 88, 12, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500 via-orange-500 to-red-500"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Commencer Maintenant
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              className="group px-10 py-5 border-3 border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400 rounded-full text-xl font-bold hover:bg-orange-50 dark:hover:bg-gray-800 transition-all shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-green-500/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Découvrir les témoignages
              </span>
            </motion.button>
          </motion.div>

          {/* Floating animated icons */}
          <motion.div 
            className="absolute top-0 left-10 md:left-20"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Heart className="w-16 h-16 text-red-400 dark:text-red-500 opacity-70" fill="currentColor" />
          </motion.div>
          
          <motion.div 
            className="absolute top-32 right-10 md:right-32"
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -10, 10, 0],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Star className="w-14 h-14 text-yellow-400 dark:text-yellow-500 opacity-70" fill="currentColor" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-20 left-1/4"
            animate={{ 
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-orange-400 dark:text-orange-500 opacity-70" />
          </motion.div>

          <motion.div 
            className="absolute bottom-32 right-1/4"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Globe className="w-14 h-14 text-green-400 dark:text-green-500 opacity-70" />
          </motion.div>
        </motion.div>

        {/* Enhanced scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 15, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-10 h-16 border-3 border-orange-500 dark:border-orange-400 rounded-full p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <motion.div 
              className="w-3 h-3 bg-gradient-to-b from-orange-500 to-green-500 rounded-full"
              animate={{ y: [0, 24, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative z-10 py-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            L'INP-HB en <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600 dark:from-orange-400 dark:to-green-400">Chiffres</span>
          </motion.h2>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <AnimatedCounter 
              value={500} 
              label="Diplômés inspirants" 
              icon={<Users className="w-12 h-12" />}
            />
            <AnimatedCounter 
              value={1200} 
              label="Témoignages partagés" 
              icon={<MessageCircle className="w-12 h-12" />}
            />
            <AnimatedCounter 
              value={50} 
              label="Entreprises représentées" 
              icon={<Building2 className="w-12 h-12" />}
            />
            <AnimatedCounter 
              value={95} 
              label="Taux de satisfaction" 
              icon={<TrendingUp className="w-12 h-12" />}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative z-10 py-24 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600 dark:from-orange-400 dark:to-green-400">
              Pourquoi rejoindre
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-2xl text-center text-gray-600 dark:text-gray-300 mb-20 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Une plateforme qui connecte les générations et inspire l'excellence
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Users className="w-14 h-14" />,
                title: "Communauté Active",
                description: "Connectez-vous avec des diplômés du monde entier et partagez vos expériences",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Building2 className="w-14 h-14" />,
                title: "Opportunités Professionnelles",
                description: "Découvrez des parcours inspirants et créez des connexions professionnelles durables",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: <Award className="w-14 h-14" />,
                title: "Mentorat & Conseils",
                description: "Bénéficiez de l'expérience des anciens et guidez la nouvelle génération",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 dark:border-gray-700">
                  <motion.div 
                    className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color} mb-6 inline-block`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                  
                  <motion.div
                    className="mt-6 flex items-center text-orange-600 dark:text-orange-400 font-semibold"
                    initial={{ x: 0 }}
                    whileHover={{ x: 10 }}
                  >
                    En savoir plus <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-32 px-4">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-green-500 rounded-3xl blur-3xl opacity-30"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />
            
            <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-green-500 rounded-3xl p-16 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt à partager votre histoire ?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Rejoignez des centaines de diplômés qui inspirent déjà la prochaine génération
              </p>
              
              <motion.button
                onClick={onGetStarted}
                className="px-12 py-6 bg-white text-orange-600 rounded-full text-xl font-bold hover:bg-gray-100 transition-colors shadow-xl"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  Commencer mon témoignage
                  <Sparkles className="w-6 h-6" />
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;








// import React, { useEffect, useState } from 'react';
// import { motion, useScroll, useTransform } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
// import { ArrowRight, Users, Heart, MessageCircle, Sparkles, GraduationCap, Building2, Star } from 'lucide-react';

// interface LandingPageProps {
//   onGetStarted: () => void;
// }

// const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const { scrollYProgress } = useScroll();
  
//   // Parallax transforms
//   const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
//   const yText = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

//   // Mouse follower effect
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   // Animated background shapes
//   const FloatingShape = ({ delay = 0, size = 'lg' }) => (
//     <motion.div
//       className={`absolute rounded-full bg-gradient-to-br from-orange-400/20 to-green-400/20 blur-3xl
//         ${size === 'lg' ? 'w-96 h-96' : size === 'md' ? 'w-64 h-64' : 'w-48 h-48'}`}
//       animate={{
//         x: [0, 100, 0],
//         y: [0, -100, 0],
//         scale: [1, 1.2, 1],
//       }}
//       transition={{
//         duration: 20,
//         delay,
//         repeat: Infinity,
//         ease: "easeInOut"
//       }}
//     />
//   );

//   // Stats counter animation
//   const AnimatedCounter = ({ value, label }: { value: number; label: string }) => {
//     const [count, setCount] = useState(0);
//     const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

//     useEffect(() => {
//       if (inView) {
//         const timer = setInterval(() => {
//           setCount(prev => {
//             if (prev < value) return prev + Math.ceil(value / 50);
//             return value;
//           });
//         }, 50);
//         return () => clearInterval(timer);
//       }
//     }, [inView, value]);

//     return (
//       <div ref={ref} className="text-center">
//         <div className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600">
//           {count}+
//         </div>
//         <div className="text-gray-600 mt-2">{label}</div>
//       </div>
//     );
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
//       {/* Custom cursor */}
//       <motion.div
//         className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference"
//         animate={{
//           x: mousePosition.x - 16,
//           y: mousePosition.y - 16,
//         }}
//         transition={{ type: "spring", stiffness: 500, damping: 28 }}
//       >
//         <div className="w-full h-full bg-orange-500 rounded-full animate-pulse" />
//       </motion.div>

//       {/* Animated background shapes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <FloatingShape delay={0} size="lg" />
//         <FloatingShape delay={5} size="md" />
//         <FloatingShape delay={10} size="sm" />
//         <div className="absolute top-1/4 right-1/4">
//           <FloatingShape delay={2} size="md" />
//         </div>
//         <div className="absolute bottom-1/4 left-1/3">
//           <FloatingShape delay={7} size="lg" />
//         </div>
//       </div>

//       {/* Hero Section */}
//       <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
//         <motion.div 
//           className="text-center max-w-5xl mx-auto"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           {/* Logo Animation */}
//           <motion.div
//             className="mb-8 flex justify-center"
//             animate={{ 
//               rotate: [0, 360],
//             }}
//             transition={{
//               duration: 20,
//               repeat: Infinity,
//               ease: "linear"
//             }}
//           >
//             <div className="relative w-32 h-32">
//               <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 rounded-full blur-xl animate-pulse" />
//               <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center">
//                 <GraduationCap className="w-16 h-16 text-orange-600" />
//               </div>
//             </div>
//           </motion.div>

//           <motion.h1 
//             className="text-5xl md:text-7xl font-bold mb-6"
//             style={{ y: yText }}
//           >
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-green-600 animate-gradient-x">
//               INP-HB Stories
//             </span>
//           </motion.h1>

//           <motion.p 
//             className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             Découvrez les parcours inspirants des diplômés de l'INP-HB.
//             <br />
//             <span className="text-orange-600 font-semibold">Partagez votre histoire, inspirez la nouvelle génération.</span>
//           </motion.p>

//           {/* CTA Buttons */}
//           <motion.div 
//             className="flex flex-col sm:flex-row gap-4 justify-center"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//           >
//             <motion.button
//               onClick={onGetStarted}
//               className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-lg font-semibold overflow-hidden"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <span className="relative z-10 flex items-center gap-2">
//                 Commencer <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
//               </span>
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600"
//                 initial={{ x: "100%" }}
//                 whileHover={{ x: 0 }}
//                 transition={{ duration: 0.3 }}
//               />
//             </motion.button>

//             <motion.button
//               className="px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Découvrir les témoignages
//             </motion.button>
//           </motion.div>

//           {/* Floating icons */}
//           <div className="absolute -top-10 -left-10 animate-float-slow">
//             <Heart className="w-12 h-12 text-red-400 opacity-60" />
//           </div>
//           <div className="absolute top-20 -right-20 animate-float-medium">
//             <MessageCircle className="w-16 h-16 text-blue-400 opacity-60" />
//           </div>
//           <div className="absolute -bottom-10 left-1/4 animate-float-fast">
//             <Sparkles className="w-10 h-10 text-yellow-400 opacity-60" />
//           </div>
//         </motion.div>

//         {/* Scroll indicator */}
//         <motion.div 
//           className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
//           animate={{ y: [0, 10, 0] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//         >
//           <div className="w-8 h-12 border-2 border-orange-400 rounded-full p-1">
//             <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
//           </div>
//         </motion.div>
//       </section>

//       {/* Stats Section */}
//       <section className="relative z-10 py-20 px-4">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
//           <AnimatedCounter value={500} label="Diplômés inspirants" />
//           <AnimatedCounter value={1200} label="Témoignages partagés" />
//           <AnimatedCounter value={50} label="Entreprises représentées" />
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="relative z-10 py-20 px-4">
//         <motion.div 
//           className="max-w-6xl mx-auto"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600">
//               Pourquoi rejoindre INP-HB Stories ?
//             </span>
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: <Users className="w-12 h-12" />,
//                 title: "Communauté Active",
//                 description: "Connectez-vous avec des diplômés du monde entier"
//               },
//               {
//                 icon: <Building2 className="w-12 h-12" />,
//                 title: "Opportunités Professionnelles",
//                 description: "Découvrez des parcours inspirants et créez des connexions"
//               },
//               {
//                 icon: <Star className="w-12 h-12" />,
//                 title: "Mentorat & Conseils",
//                 description: "Bénéficiez de l'expérience des anciens"
//               }
//             ].map((feature, index) => (
//               <motion.div
//                 key={index}
//                 className="relative group"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.2 }}
//                 viewport={{ once: true }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-green-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
//                 <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
//                   <div className="text-orange-600 mb-4">{feature.icon}</div>
//                   <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </section>
//     </div>
//   );
// };

// export default LandingPage;