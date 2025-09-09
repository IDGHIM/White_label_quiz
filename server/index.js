const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const connectDB = require("./src/database/database");
const PORT = process.env.PORT || 3001;

// ================================
// 🛡️ HEADERS DE SÉCURITÉ - PRIORITÉ ABSOLUE
// ================================
app.use((req, res, next) => {
  // Empêche le MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Empêche l'intégration dans des iframes (protection clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Active la protection XSS du navigateur
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Contrôle les informations referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Politique de sécurité du contenu (CSP adaptée pour votre app)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' ws: wss: https://hackathon-quiz-4g3a.onrender.com"
  );
  
  // HSTS uniquement en production HTTPS
  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// ================================
// 🚦 RATE LIMITING - SOLUTION COMPLÈTE IPv6
// ================================

// Rate limiting global - configuration simple
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    success: false,
    error: 'Trop de requêtes, réessayez dans 15 minutes',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Exclure certaines routes du rate limiting global
    return req.url.startsWith('/api/verify/') || req.url === '/';
  }
});

// Rate limiting STRICT pour l'authentification - SANS keyGenerator custom
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, réessayez plus tard',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne compte que les échecs
  // PAS de keyGenerator - express-rate-limit gère IPv6 automatiquement
});

// Rate limiting API modéré
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Limite API atteinte, réessayez plus tard'
  }
});

// Rate limiting pour les admins
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Limite admin atteinte'
  }
});

// Appliquer le rate limiting global
app.use(globalLimiter);

// ================================
// 🌐 MIDDLEWARE CORS SÉCURISÉ
// ================================
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://localhost:5173", 
      "https://hackathon-quiz-4g3a.onrender.com",
      "http://localhost:3000",
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqué pour origin: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
}));

// ================================
// 🔒 MIDDLEWARES DE SÉCURITÉ
// ================================

// Protection contre l'exposition de fichiers sensibles
app.use((req, res, next) => {
  const forbiddenPaths = [
    '/.env', '/config.php', '/wp-config.php', '/database.yml',
    '/app.config', '/.git/', '/backup.sql', '/phpinfo.php',
    '/server-status', '/debug', '/api/debug'
  ];
  
  if (forbiddenPaths.some(path => req.url.startsWith(path))) {
    console.warn(`🚨 Tentative d'accès à un fichier sensible: ${req.url} depuis ${req.ip}`);
    return res.status(404).json({ 
      success: false,
      error: 'Not Found' 
    });
  }
  next();
});

// Body parsing avec limites de sécurité
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length > 1024 * 1024) { // > 1MB
      console.warn(`⚠️ Requête de grande taille: ${buf.length} bytes depuis ${req.ip}`);
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging sécurisé des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  console.log(`${timestamp} - ${req.method} ${req.url} - IP: ${req.ip} - UA: ${userAgent.substring(0, 50)}`);
  next();
});

// Connexion DB
connectDB();

// ================================
// 🏠 ROUTE DE BASE
// ================================
app.get("/", (req, res) => {
  res.json({ 
    message: "API fonctionnel!",
    security: "Headers et rate limiting activés",
    timestamp: new Date().toISOString()
  });
});

// ================================
// 🔐 AUTHENTIFICATION MIDDLEWARE
// ================================
let protect = null;
let authorize = null;
try {
  console.log("🔐 Test authMiddleware...");
  const authMiddleware = require("./src/middlewares/authMiddleware");
  protect = authMiddleware.protect;
  authorize = authMiddleware.authorize;
  console.log("✅ authMiddleware OK - protect et authorize functions loaded");
} catch (error) {
  console.error("❌ ERREUR dans authMiddleware:", error.message);
  protect = (req, res, next) => {
    res.status(501).json({ 
      success: false,
      message: "Middleware d'authentification non disponible" 
    });
  };
  authorize = (...roles) => (req, res, next) => {
    res.status(501).json({ 
      success: false,
      message: "Middleware d'autorisation non disponible" 
    });
  };
}

// ================================
// 📡 CRÉATION DU ROUTEUR API
// ================================
const apiRouter = express.Router();

console.log("🧪 Phase de test - Intégration progressive...");

// ================================
// 🔑 ROUTES D'AUTHENTIFICATION
// ================================
try {
  console.log("1️⃣ Test authController...");
  const authController = require("./src/controllers/authController");

  // Routes auth avec validation et rate limiting
  apiRouter.post("/register", authLimiter, (req, res, next) => {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe et nom d'utilisateur requis"
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide"
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }
    
    next();
  }, authController.register);

  apiRouter.post("/login", authLimiter, (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis"
      });
    }
    
    next();
  }, authController.login);

  apiRouter.post("/logout", authController.logout);
  apiRouter.post("/password-reset-request", authLimiter, authController.requestPasswordReset);
  apiRouter.post("/reset-password", authLimiter, authController.resetPassword);
  apiRouter.get("/verify/:token", authController.verifyEmail);
  apiRouter.post("/resend-verification", authLimiter, authController.resendVerificationEmail);
  apiRouter.get("/me", protect, authController.me);

  console.log("✅ authController OK");
} catch (error) {
  console.error("❌ ERREUR dans authController:", error.message);
  console.error(error.stack);
  
  apiRouter.get("/me", (req, res) => {
    res.status(500).json({ 
      success: false, 
      message: "AuthController non disponible (fallback)" 
    });
  });
}

// ================================
// 👥 ROUTES UTILISATEURS
// ================================
try {
  console.log("2️⃣ Test userController...");
  const userController = require("./src/controllers/userController");

  apiRouter.get("/users", apiLimiter, userController.index);
  apiRouter.get("/users/:id", apiLimiter, userController.show);
  apiRouter.post("/users", apiLimiter, userController.create);
  apiRouter.put("/users/:id", apiLimiter, userController.update);
  apiRouter.delete("/users/:id", apiLimiter, userController.delete);

  console.log("✅ userController OK");
} catch (error) {
  console.error("❌ ERREUR dans userController:", error.message);
  console.error(error.stack);

  apiRouter.get("/users", (req, res) => {
    res.json({ 
      success: true,
      message: "Users route OK (fallback)" 
    });
  });
}

// ================================
// ❓ ROUTES QUESTIONS
// ================================
try {
  console.log("3️⃣ Test questionController...");
  const questionController = require("./src/controllers/questionController");

  apiRouter.get("/questions", apiLimiter, (req, res, next) => {
    const { category, limit, offset } = req.query;
    
    if (limit && (isNaN(limit) || limit < 0 || limit > 100)) {
      return res.status(400).json({
        success: false,
        message: "Paramètre 'limit' invalide (0-100)"
      });
    }
    
    if (offset && (isNaN(offset) || offset < 0)) {
      return res.status(400).json({
        success: false,
        message: "Paramètre 'offset' invalide"
      });
    }
    
    next();
  }, questionController.index);

  apiRouter.get("/questions/:id", apiLimiter, (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de question invalide"
      });
    }
    next();
  }, questionController.show);

  apiRouter.post("/questions", apiLimiter, questionController.create);
  apiRouter.put("/questions/:id", apiLimiter, questionController.update);
  apiRouter.delete("/questions/:id", apiLimiter, questionController.delete);

  console.log("✅ questionController OK");
} catch (error) {
  console.error("❌ ERREUR dans questionController:", error.message);
  console.error(error.stack);

  apiRouter.get("/questions", (req, res) => {
    res.json({ 
      success: true,
      message: "Questions route OK (fallback)" 
    });
  });
}

// ================================
// 📝 ROUTES QUIZ
// ================================
try {
  console.log("4️⃣ Test quizController...");
  const quizController = require("./src/controllers/quizController");

  apiRouter.get("/quizzes", apiLimiter, quizController.index);
  apiRouter.get("/quizzes/:id", apiLimiter, quizController.show);
  apiRouter.post("/quizzes", apiLimiter, quizController.create);
  apiRouter.put("/quizzes/:id", apiLimiter, quizController.update);
  apiRouter.delete("/quizzes/:id", apiLimiter, quizController.delete);
  apiRouter.post("/quizzes/:id/duplicate", apiLimiter, quizController.duplicate);

  console.log("✅ quizController OK");
} catch (error) {
  console.error("❌ ERREUR dans quizController:", error.message);
  console.error(error.stack);

  apiRouter.get("/quizzes", (req, res) => {
    res.json({ 
      success: true,
      message: "Quizzes route OK (fallback)",
      data: [
        {
          id: 1,
          title: "Quiz Test Sécurisé",
          questions: [
            {
              id: 1,
              question: "Quelle est la couleur du ciel ?",
              optionA: "Bleu",
              optionB: "Rouge",
              optionC: "Vert",
              correctAnswers: ["Bleu"]
            },
            {
              id: 2,
              question: "Combien font 2 + 2 ?",
              optionA: "3",
              optionB: "4",
              optionC: "5",
              correctAnswers: ["4"]
            }
          ]
        }
      ]
    });
  });
}

// ================================
// 👑 ROUTES PROTÉGÉES ET ADMIN
// ================================
console.log("🔐 Configuration des routes protégées par rôle...");

try {
  // Route profil
  apiRouter.get("/profil", protect, (req, res) => {
    let accessLevel;
    switch(req.user.role) {
      case "admin":
        accessLevel = "admin";
        break;
      case "user":
        accessLevel = "user";
        break;
      default:
        accessLevel = "profil";
    }

    res.json({
      success: true,
      message: "Accès au profil autorisé",
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role
        },
        accessLevel: accessLevel
      }
    });
  });

  // Routes admin individuelles avec rate limiting
  apiRouter.get("/admin", adminLimiter, protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Accès admin autorisé",
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        accessLevel: "admin",
        adminFeatures: [
          "Gestion des utilisateurs",
          "Gestion des quiz",
          "Statistiques globales",
          "Logs de sécurité"
        ]
      }
    });
  });

  apiRouter.get("/admin/dashboard", adminLimiter, protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Dashboard admin",
      data: {
        stats: {
          totalUsers: 0,
          totalQuizzes: 0,
          totalQuestions: 0,
          securityAlerts: 0
        }
      }
    });
  });

  apiRouter.get("/admin/users", adminLimiter, protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Liste des utilisateurs (admin)",
      data: {
        users: []
      }
    });
  });

  apiRouter.put("/admin/users/:id/role", adminLimiter, protect, authorize("admin"), async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Rôle invalide. Valeurs acceptées: 'user', 'admin'"
        });
      }

      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide"
        });
      }

      if (req.user.id === req.params.id && role === "user") {
        return res.status(400).json({
          success: false,
          message: "Vous ne pouvez pas retirer vos propres droits administrateur"
        });
      }

      const User = require("./src/models/Users");
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      user.role = role;
      await user.save();

      console.log(`🔧 Admin ${req.user.email} a modifié le rôle de ${user.email} vers ${role}`);

      res.json({
        success: true,
        message: `Rôle modifié avec succès vers ${role}`,
        data: {
          user: user.toPublicJSON ? user.toPublicJSON() : {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error("Erreur modification rôle:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la modification du rôle"
      });
    }
  });

  apiRouter.get("/check-permissions", protect, (req, res) => {
    const permissions = {
      canAccessProfil: true,
      canAccessAdmin: req.user.role === "admin",
      currentRole: req.user.role,
      userId: req.user.id
    };

    res.json({
      success: true,
      data: permissions
    });
  });

  console.log("✅ Routes protégées configurées avec sécurité renforcée");

} catch (error) {
  console.error("❌ ERREUR dans la configuration des routes protégées:", error.message);
}

// ================================
// 🔗 APPLICATION DU ROUTEUR
// ================================
app.use("/api", apiRouter);

// ================================
// 🛡️ GESTION GLOBALE DES ERREURS
// ================================
app.use((error, req, res, next) => {
  console.error('🚨 Erreur globale:', error);
  
  if (error.message === 'Non autorisé par CORS') {
    return res.status(403).json({ 
      success: false,
      error: 'Accès refusé par CORS' 
    });
  }
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Format JSON invalide'
    });
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : error.message
  });
});

// Route 404 sécurisée - CORRECTION ICI
app.use((req, res) => {
  console.warn(`🔍 Route non trouvée: ${req.method} ${req.url} depuis ${req.ip}`);
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

console.log("🎉 Tous les contrôleurs testés avec sécurité renforcée !");

// ================================
// 🚀 DÉMARRAGE SERVEUR SÉCURISÉ
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🛡️ SÉCURITÉ ACTIVÉE:");
  console.log("  ✓ Headers de sécurité configurés");
  console.log("  ✓ Rate limiting IPv6 compatible");
  console.log("  ✓ Protection CORS configurée");
  console.log("  ✓ Validation des entrées");
  console.log("  ✓ Protection fichiers sensibles");
  console.log("  ✓ Gestion d'erreurs sécurisée");
  
  console.log("\n🌐 CORS autorisé pour:");
  console.log("  - http://localhost:5173 (Vite dev)");
  console.log("  - https://hackathon-quiz-4g3a.onrender.com (Production)");
  
  console.log("\n📋 Routes disponibles:");
  
  console.log("\n🔓 Routes publiques (rate limited):");
  console.log("  POST /api/register (5 req/15min)");
  console.log("  POST /api/login (5 req/15min)");
  console.log("  POST /api/logout");
  console.log("  GET  /api/verify/:token");
  console.log("  POST /api/resend-verification (5 req/15min)");
  console.log("  POST /api/password-reset-request (5 req/15min)");
  console.log("  POST /api/reset-password (5 req/15min)");
  
  console.log("\n🔒 Routes protégées (connecté + rate limited):");
  console.log("  GET  /api/me");
  console.log("  GET  /api/profil (user + admin)");
  console.log("  GET  /api/check-permissions");
  
  console.log("\n👑 Routes admin uniquement (rate limited admin):");
  console.log("  GET  /api/admin");
  console.log("  GET  /api/admin/dashboard");
  console.log("  GET  /api/admin/users");
  console.log("  PUT  /api/admin/users/:id/role");
  
  console.log("\n📊 Routes API générales (rate limited API):");
  console.log("  GET  /api/users (50 req/15min)");
  console.log("  GET  /api/questions (50 req/15min)");
  console.log("  GET  /api/quizzes (50 req/15min)");
  
  console.log("\n🚦 Rate Limits configurés:");
  console.log("  - Global: 100 req/15min par IP");
  console.log("  - Auth: 5 req/15min par IP (IPv6 compatible)");
  console.log("  - API: 50 req/15min par IP");
  console.log("  - Admin: 200 req/15min par IP");
});