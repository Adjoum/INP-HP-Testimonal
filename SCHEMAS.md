# 📊 Schémas et Architecture - INP-HB Stories

## 🗄️ Schéma de Base de Données MongoDB

### Modèle Entité/Association

```
┌─────────────────────┐
│       USER          │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ name: String        │
│ email: String       │
│ password: String    │
│ avatar: String      │
│ promotion: String   │
│ verified: Boolean   │
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
          │
          │ 1:N (author)
          │
          ▼
┌─────────────────────┐
│   TESTIMONIAL       │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ author: ObjectId(FK)│ ──► USER
│ content: String     │
│ likes: [ObjectId]   │ ──► USER (N:N)
│ likesCount: Number  │
│ commentsCount: Number│
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
          │
          │ 1:N
          │
          ▼
┌───────────────────────┐
│      COMMENT          │
├───────────────────────┤
│ _id: ObjectId (PK)    │
│ author: ObjectId (FK) │ ──► USER
│ testimonial: ObjId(FK)│ ──► TESTIMONIAL
│ parentComment: ObjId  │ ──► COMMENT (récursif)
│ content: String       │
│ likes: [ObjectId]     │ ──► USER (N:N)
│ likesCount: Number    │
│ repliesCount: Number  │
│ depth: Number         │
│ createdAt: Date       │
│ updatedAt: Date       │
└───────────────────────┘
          │
          │ 1:N (récursif)
          │
          ▼
     ┌────────┐
     │ COMMENT│ (réponses)
     └────────┘
```

### Relations

#### 1. USER ──(1:N)──► TESTIMONIAL
- Un utilisateur peut créer plusieurs témoignages
- Un témoignage appartient à un seul utilisateur

#### 2. USER ──(N:N)──► TESTIMONIAL (Likes)
- Un utilisateur peut liker plusieurs témoignages
- Un témoignage peut être liké par plusieurs utilisateurs
- Implémenté via un tableau `likes[]` dans Testimonial

#### 3. TESTIMONIAL ──(1:N)──► COMMENT
- Un témoignage peut avoir plusieurs commentaires
- Un commentaire appartient à un seul témoignage

#### 4. COMMENT ──(1:N)──► COMMENT (Récursif)
- Un commentaire peut avoir plusieurs réponses
- Une réponse est liée à un commentaire parent
- Structure arborescente infinie

#### 5. USER ──(N:N)──► COMMENT (Likes)
- Un utilisateur peut liker plusieurs commentaires
- Un commentaire peut être liké par plusieurs utilisateurs
- Implémenté via un tableau `likes[]` dans Comment

## 🏗️ Architecture Full-Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           React + TypeScript Frontend               │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │Components│  │  Hooks   │  │ Context  │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │         Services Layer               │          │    │
│  │  │  ┌──────────┐      ┌──────────┐     │          │    │
│  │  │  │  Axios   │      │ Socket.IO│     │          │    │
│  │  │  │(HTTP API)│      │  Client  │     │          │    │
│  │  │  └──────────┘      └──────────┘     │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                            │
         │ HTTP/REST                  │ WebSocket (Socket.IO)
         │                            │
┌────────▼────────────────────────────▼───────────────────────┐
│                    NETWORK LAYER                             │
│                   (Internet/LAN)                             │
└──────────────────────────────────────────────────────────────┘
         │                            │
         │ HTTP/REST                  │ WebSocket (Socket.IO)
         │                            │
┌────────▼────────────────────────────▼───────────────────────┐
│                   SERVER (Node.js)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Express.js + TypeScript Backend           │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  Routes  │  │Controller│  │Middleware│         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │       Real-Time Layer                │          │    │
│  │  │  ┌──────────────────────────┐        │          │    │
│  │  │  │    Socket.IO Server      │        │          │    │
│  │  │  │   (WebSocket Manager)    │        │          │    │
│  │  │  └──────────────────────────┘        │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │           Data Layer                 │          │    │
│  │  │  ┌──────────────────────────┐        │          │    │
│  │  │  │   Mongoose ODM           │        │          │    │
│  │  │  │   (Models & Schemas)     │        │          │    │
│  │  │  └──────────────────────────┘        │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ MongoDB Driver
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE LAYER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              MongoDB Database                       │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Collections  │  │   Indexes    │               │    │
│  │  │  - users     │  │  - author    │               │    │
│  │  │  - testimon. │  │  - createdAt │               │    │
│  │  │  - comments  │  │  - likes     │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### Flux API REST (Création de Témoignage)

```
┌─────────┐     1. POST /api/testimonials     ┌─────────┐
│ Client  │ ───────────────────────────────► │  Express │
│ (React) │                                   │  Server  │
└─────────┘                                   └─────────┘
     ▲                                             │
     │                                             │
     │                                        2. Validate
     │                                        JWT Token
     │                                             │
     │                                             ▼
     │                                        ┌─────────┐
     │                                        │  Auth   │
     │                                        │Middleware│
     │                                        └─────────┘
     │                                             │
     │                                        3. Create
     │                                        Testimonial
     │                                             │
     │                                             ▼
     │                                        ┌─────────┐
     │                                        │Testimonial
     │                                        │Controller│
     │                                        └─────────┘
     │                                             │
     │                                        4. Save to
     │                                        Database
     │                                             │
     │                                             ▼
     │                                        ┌─────────┐
     │                                        │ MongoDB │
     │                                        └─────────┘
     │                                             │
     │                                        5. Return
     │                                        Success
     │                                             │
     │      6. Response + Created Data             │
     └─────────────────────────────────────────────┘
```

### Flux Socket.IO (Temps Réel)

```
┌─────────┐                              ┌──────────┐
│ Client A│                              │ Client B │
└────┬────┘                              └────┬─────┘
     │                                        │
     │ 1. Create Comment                     │
     │ (via HTTP REST API)                   │
     ├────────────┐                          │
     │            ▼                          │
     │       ┌──────────┐                   │
     │       │  Server  │                   │
     │       │(Express) │                   │
     │       └─────┬────┘                   │
     │             │ 2. Save to DB          │
     │             ▼                         │
     │       ┌──────────┐                   │
     │       │ MongoDB  │                   │
     │       └─────┬────┘                   │
     │             │ 3. Success             │
     │             ▼                         │
     │       ┌──────────┐                   │
     │       │Socket.IO │                   │
     │       │  Server  │                   │
     │       └─────┬────┘                   │
     │             │                         │
     │             │ 4. Emit 'comment-      │
     │             │    created' event      │
     │             ├─────────────────────────┤
     │             │                         │
     │ 5. Receive  ▼                         ▼ 5. Receive
     │   Event  ┌──────────┐          ┌──────────┐ Event
     │◄─────────┤Socket.IO │          │Socket.IO │────────►│
               │  Client  │          │  Client  │
               └──────────┘          └──────────┘
                    │                      │
                    │ 6. Update UI         │ 6. Update UI
                    │   (add comment)      │   (add comment)
                    ▼                      ▼
               Component Re-render   Component Re-render
```

## 🔐 Flux d'Authentification JWT

```
1. INSCRIPTION/CONNEXION
┌─────────┐   Email/Password    ┌──────────┐
│  Client │ ──────────────────► │  Server  │
└─────────┘                     └──────────┘
                                      │
                                      │ 1. Validate
                                      │ 2. Hash Password
                                      │ 3. Save/Compare
                                      ▼
                                ┌──────────┐
                                │ MongoDB  │
                                └──────────┘
                                      │
                                      │ 4. Generate JWT
                                      ▼
┌─────────┐   JWT Token + User  ┌──────────┐
│  Client │ ◄─────────────────  │  Server  │
└─────────┘                     └──────────┘
     │
     │ 5. Store in localStorage
     ▼
localStorage
─────────────
token: "eyJhb..."
user: {...}


2. REQUÊTES AUTHENTIFIÉES
┌─────────┐   Request + JWT     ┌──────────┐
│  Client │ ──────────────────► │  Server  │
└─────────┘   Authorization:    └──────────┘
              Bearer eyJhb...          │
                                       │ 1. Extract Token
                                       │ 2. Verify JWT
                                       │ 3. Decode User ID
                                       ▼
                                 ┌──────────┐
                                 │   Auth   │
                                 │Middleware│
                                 └──────────┘
                                       │
                                       │ 4. Fetch User
                                       ▼
                                 ┌──────────┐
                                 │ MongoDB  │
                                 └──────────┘
                                       │
                                       │ 5. Attach to req
                                       ▼
                                 ┌──────────┐
                                 │Controller│
                                 └──────────┘
```

## 📈 Performance et Optimisation

### Index MongoDB
```javascript
// Testimonial
testimonialSchema.index({ author: 1, createdAt: -1 });
testimonialSchema.index({ likesCount: -1 });
testimonialSchema.index({ commentsCount: -1 });
testimonialSchema.index({ createdAt: -1 });

// Comment
commentSchema.index({ testimonial: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });
```

### Dénormalisation
Pour optimiser les performances, certaines données sont dénormalisées:
- `likesCount` - Compteur de likes (évite de compter le tableau)
- `commentsCount` - Compteur de commentaires
- `repliesCount` - Compteur de réponses

### Socket.IO Rooms
Utilisation de rooms pour limiter la diffusion des événements:
- Chaque témoignage a sa propre room
- Les clients rejoignent uniquement les rooms nécessaires
- Réduit la bande passante et améliore les performances

## 🧩 Patterns Utilisés

### Backend
- **MVC** (Model-View-Controller)
- **Middleware Pattern** (Express.js)
- **Repository Pattern** (Mongoose Models)
- **Singleton Pattern** (Database Connection)

### Frontend
- **Component Pattern** (React)
- **Custom Hooks Pattern**
- **Context API Pattern** (State Management)
- **Service Layer Pattern** (API calls)

---

**Made with ❤️ for INP-HB | 🎓 Excellence & Innovation**
