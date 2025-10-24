# 🎓 INP-HB Stories - Full-Stack Application

Une application web moderne avec communication temps réel pour permettre aux étudiants et anciens de l'INP-HB de partager leurs témoignages.

## 📦 Stack Technique

### Backend
- **Node.js** + **Express** - Serveur API REST
- **TypeScript** - Typage statique
- **MongoDB** + **Mongoose** - Base de données NoSQL
- **Socket.IO** - Communication temps réel
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hashage des mots de passe

### Frontend
- **React 18** + **TypeScript** - Interface utilisateur
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS moderne
- **Socket.IO Client** - Communication temps réel
- **Axios** - Requêtes HTTP
- **React Hot Toast** - Notifications
- **Lucide React** - Icônes

## 🏗️ Architecture du Projet

```
inphb-stories-fullstack/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── models/            # Modèles MongoDB (User, Testimonial, Comment)
│   │   ├── controllers/       # Logique métier
│   │   ├── routes/            # Routes API REST
│   │   ├── middleware/        # Middlewares (auth, errors)
│   │   ├── config/            # Configuration (database)
│   │   ├── types/             # Types TypeScript
│   │   └── server.ts          # Point d'entrée + Socket.IO
│   ├── .env.example           # Variables d'environnement
│   ├── tsconfig.json          # Configuration TypeScript
│   └── package.json
│
└── frontend/                   # Application Frontend
    ├── src/
    │   ├── components/        # Composants React
    │   │   ├── auth/          # Composants d'authentification
    │   │   ├── testimonials/  # Composants de témoignages
    │   │   ├── comments/      # Composants de commentaires
    │   │   └── common/        # Composants réutilisables
    │   ├── contexts/          # React Context (Auth, Socket)
    │   ├── hooks/             # Custom hooks
    │   ├── services/          # Services API et Socket.IO
    │   ├── types/             # Types TypeScript
    │   ├── utils/             # Utilitaires
    │   ├── App.tsx            # Composant principal
    │   └── main.tsx           # Point d'entrée
    ├── .env.example           # Variables d'environnement
    ├── tailwind.config.js     # Configuration Tailwind
    ├── tsconfig.json          # Configuration TypeScript
    └── package.json
```

## 📊 Schémas de Base de Données (MongoDB)

### Collection: Users
```javascript
{
  _id: ObjectId,
  name: String,           // Nom complet
  email: String,          // Email unique
  password: String,       // Hash bcrypt
  avatar: String,         // URL de l'avatar
  promotion: String,      // Ex: "Promo 2023 - Génie Informatique"
  verified: Boolean,      // Badge vérifié
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: Testimonials
```javascript
{
  _id: ObjectId,
  author: ObjectId,       // Référence User
  content: String,        // Contenu du témoignage
  likes: [ObjectId],      // Tableau de User IDs
  likesCount: Number,     // Compteur denormalisé
  commentsCount: Number,  // Compteur denormalisé
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: Comments (Structure Récursive)
```javascript
{
  _id: ObjectId,
  author: ObjectId,       // Référence User
  testimonial: ObjectId,  // Référence Testimonial
  parentComment: ObjectId // Référence Comment (null si commentaire principal)
  content: String,        // Contenu du commentaire
  likes: [ObjectId],      // Tableau de User IDs
  likesCount: Number,     // Compteur denormalisé
  repliesCount: Number,   // Nombre de réponses directes
  depth: Number,          // Profondeur dans l'arbre (0-10)
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Communication Temps Réel (Socket.IO)

### Événements émis par le client:
- `join-testimonial` - Rejoindre une room de témoignage
- `leave-testimonial` - Quitter une room
- `new-testimonial` - Nouveau témoignage créé
- `testimonial-like` - Like/Unlike témoignage
- `new-comment` - Nouveau commentaire
- `comment-like` - Like/Unlike commentaire
- `delete-testimonial` - Suppression témoignage
- `delete-comment` - Suppression commentaire
- `typing` - Utilisateur en train de taper
- `stop-typing` - Utilisateur a arrêté de taper

### Événements reçus par le client:
- `testimonial-created` - Nouveau témoignage diffusé
- `testimonial-like-update` - Mise à jour des likes
- `comment-created` - Nouveau commentaire diffusé
- `comment-like-update` - Mise à jour des likes de commentaire
- `testimonial-deleted` - Témoignage supprimé
- `comment-deleted` - Commentaire supprimé
- `user-typing` - Quelqu'un tape
- `user-stop-typing` - Quelqu'un a arrêté de taper

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** version 18 ou supérieure
- **MongoDB** installé et en cours d'exécution
- **npm** ou **yarn**

### 1. Configuration du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier .env.example et le renommer en .env
cp .env.example .env

# Modifier les variables d'environnement dans .env
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/inphb-stories
# JWT_SECRET=votre_secret_jwt_super_secret
# FRONTEND_URL=http://localhost:5173

# Démarrer MongoDB (si pas déjà démarré)
# Sur Linux/Mac:
mongod

# Sur Windows:
# net start MongoDB

# Démarrer le serveur en mode développement
npm run dev
```

Le backend sera accessible sur **http://localhost:5000**

### 2. Configuration du Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Copier le fichier .env.example et le renommer en .env
cp .env.example .env

# Modifier les variables d'environnement dans .env
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Démarrer l'application en mode développement
npm run dev
```

Le frontend sera accessible sur **http://localhost:5173**

## 📡 API REST Endpoints

### Authentification (`/api/auth`)
- `POST /register` - Créer un compte
- `POST /login` - Se connecter
- `GET /me` - Obtenir le profil (🔒 Protégé)

### Témoignages (`/api/testimonials`)
- `GET /` - Lister tous les témoignages
- `POST /` - Créer un témoignage (🔒 Protégé)
- `GET /:id` - Obtenir un témoignage
- `DELETE /:id` - Supprimer un témoignage (🔒 Protégé)
- `POST /:id/like` - Liker/Unliker (🔒 Protégé)

### Commentaires (`/api/comments`)
- `POST /` - Créer un commentaire/réponse (🔒 Protégé)
- `GET /testimonial/:testimonialId` - Lister les commentaires
- `POST /:id/like` - Liker/Unliker (🔒 Protégé)
- `DELETE /:id` - Supprimer un commentaire (🔒 Protégé)

## 🎯 Fonctionnalités Temps Réel

### ✨ Mises à jour instantanées
- ✅ Nouveaux témoignages apparaissent automatiquement
- ✅ Les likes se mettent à jour en temps réel
- ✅ Les commentaires s'affichent instantanément
- ✅ Indicateur "en train de taper..."
- ✅ Notifications de suppressions

### 🔒 Système de Rooms Socket.IO
Chaque témoignage a sa propre "room" Socket.IO. Les utilisateurs rejoignent automatiquement la room quand ils consultent un témoignage, permettant des mises à jour ciblées sans surcharger le réseau.

## 💡 Concepts Clés Implémentés

### 1. Commentaires Récursifs Infinis
Structure arborescente permettant des réponses imbriquées illimitées, comme sur Facebook. Chaque commentaire peut avoir des réponses, qui peuvent elles-mêmes avoir des réponses, etc.

```
Commentaire 1
├── Réponse 1.1
│   ├── Réponse 1.1.1
│   │   └── Réponse 1.1.1.1
│   └── Réponse 1.1.2
└── Réponse 1.2
```

### 2. Authentification JWT
- Token JWT généré à la connexion
- Token stocké dans localStorage
- Middleware de protection des routes privées
- Token ajouté automatiquement aux requêtes API

### 3. WebSocket avec Socket.IO
- Connexion persistante bidirectionnelle
- Événements personnalisés pour chaque action
- System de rooms pour optimiser la bande passante
- Reconnexion automatique en cas de déconnexion

### 4. State Management React
- React Context API pour l'état global (auth, socket)
- Custom hooks pour la logique réutilisable
- useState et useEffect pour l'état local

## 🎨 Personnalisation

### Couleurs INP-HB
Les couleurs sont définies dans `frontend/tailwind.config.js`:

```javascript
colors: {
  'inphb-orange': {
    500: '#f97316',  // Couleur principale
    600: '#ea580c',
  },
  'inphb-green': {
    500: '#22c55e',  // Couleur secondaire
    600: '#16a34a',
  }
}
```

### Modifier l'URL de l'API
Dans `frontend/.env`:
```
VITE_API_URL=https://votre-api.com/api
VITE_SOCKET_URL=https://votre-api.com
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev       # Mode développement avec hot-reload
npm run build     # Compiler TypeScript vers JavaScript
npm start         # Démarrer en mode production
npm run watch     # Compiler TypeScript en mode watch
```

### Frontend
```bash
npm run dev       # Mode développement avec hot-reload
npm run build     # Build de production
npm run preview   # Prévisualiser le build
npm run lint      # Vérifier le code
```

## 🐛 Résolution de Problèmes

### Backend ne démarre pas
1. Vérifiez que MongoDB est démarré
2. Vérifiez les variables d'environnement dans `.env`
3. Supprimez `node_modules` et réinstallez: `npm install`

### Frontend ne se connecte pas au backend
1. Vérifiez que le backend est démarré
2. Vérifiez les URLs dans `frontend/.env`
3. Vérifiez la console du navigateur pour les erreurs CORS

### Socket.IO ne fonctionne pas
1. Vérifiez que `VITE_SOCKET_URL` est correct
2. Vérifiez la console du navigateur
3. Vérifiez que le backend affiche "Socket.IO prêt"

### Erreur de connexion MongoDB
```bash
# Démarrer MongoDB manuellement
mongod --dbpath /chemin/vers/votre/data/db
```

## 📚 Technologies et Ressources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)

## 🎓 Concepts Pédagogiques

Ce projet illustre concrètement les concepts vus en cours:

### Base de Données
- Modèle Entité/Association
- Relations 1:N et N:N
- Structure récursive (commentaires)
- Dénormalisation (compteurs)
- Index pour les performances

### Architecture Logicielle
- Architecture client-serveur
- API REST
- Séparation des responsabilités (MVC)
- Middleware
- Authentification/Autorisation

### Programmation
- TypeScript (typage fort)
- Programmation asynchrone
- Gestion d'état
- Composants réutilisables
- Hooks personnalisés

## 🚀 Améliorations Futures

- [ ] Upload d'images pour les témoignages
- [ ] Système de notifications push
- [ ] Recherche avancée avec filtres
- [ ] Mode sombre
- [ ] Application mobile (React Native)
- [ ] Messagerie privée entre étudiants
- [ ] Groupes par promotion
- [ ] Système de badges et gamification
- [ ] Analytics et statistiques
- [ ] Modération automatique (IA)

## 📝 Licence

Ce projet est créé à des fins éducatives pour les étudiants de l'INP-HB.

---

**Made with ❤️ for INP-HB | 🎓 Excellence & Innovation**
