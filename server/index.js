const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/database/database");
const PORT = process.env.PORT || 3001;

// Middleware CORS - Autorise à la fois le développement local ET la production
app.use(cors({
  origin: [
    "http://localhost:5173",  // Frontend Vite en développement
    "https://localhost:5173", // Si vous utilisez HTTPS en local
    "https://hackathon-quiz-4g3a.onrender.com" // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Connexion DB
connectDB();

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "API fonctionnel!" });
});

// Créer un routeur pour l'API
const apiRouter = express.Router();

// ===== ÉTAPE 1: TESTER LES CONTRÔLEURS UN PAR UN =====
console.log("🧪 Phase de test - Intégration progressive...");

// ✅ CORRECTION: Importer le bon middleware d'authentification
let protect = null;
let authorize = null;
try {
  console.log("🔐 Test authMiddleware...");
  const authMiddleware = require("./src/middlewares/authMiddleware");
  protect = authMiddleware.protect; // ✅ CORRECTION: utiliser 'protect' au lieu de 'authenticateToken'
  authorize = authMiddleware.authorize; // Import du middleware d'autorisation
  console.log("✅ authMiddleware OK - protect et authorize functions loaded");
} catch (error) {
  console.error("❌ ERREUR dans authMiddleware:", error.message);
  // Fallback middleware simple si le fichier n'existe pas
  protect = (req, res, next) => {
    res.status(501).json({ message: "Middleware d'authentification non disponible" });
  };
  authorize = (...roles) => (req, res, next) => {
    res.status(501).json({ message: "Middleware d'autorisation non disponible" });
  };
}

try {
  // Test 1: AuthController
  console.log("1️⃣ Test authController...");
  const authController = require("./src/controllers/authController");

  // Routes auth avec préfixe /api
  apiRouter.post("/register", authController.register);
  apiRouter.post("/login", authController.login);
  apiRouter.post("/logout", authController.logout);
  apiRouter.post(
    "/password-reset-request",
    authController.requestPasswordReset
  );
  apiRouter.post("/reset-password", authController.resetPassword);
  apiRouter.get("/verify/:token", authController.verifyEmail);
  apiRouter.post("/resend-verification", authController.resendVerificationEmail);
  
  // ✅ CORRECTION: Route /api/me protégée avec le bon middleware
  apiRouter.get("/me", protect, authController.me);

  console.log("✅ authController OK");
} catch (error) {
  console.error("❌ ERREUR dans authController:", error.message);
  console.error(error.stack);
  
  // Fallback route pour /api/me
  apiRouter.get("/me", (req, res) => {
    res.status(500).json({ 
      success: false, 
      message: "AuthController non disponible (fallback)" 
    });
  });
}

// ✅ OPTION ALTERNATIVE: Utiliser directement authRoutes.js
try {
  console.log("🔄 Tentative d'import des routes d'authentification...");
  const authRoutes = require("./src/routes/authRoutes");
  
  // Utiliser les routes définies dans authRoutes.js
  app.use("/api", authRoutes);
  console.log("✅ Routes d'authentification chargées depuis authRoutes.js");
} catch (error) {
  console.error("❌ ERREUR lors du chargement d'authRoutes:", error.message);
  console.log("📝 Utilisation des routes définies manuellement dans index.js");
}

try {
  // Test 2: UserController
  console.log("2️⃣ Test userController...");
  const userController = require("./src/controllers/userController");

  apiRouter.get("/users", userController.index);
  apiRouter.get("/users/:id", userController.show);
  apiRouter.post("/users", userController.create);
  apiRouter.put("/users/:id", userController.update);
  apiRouter.delete("/users/:id", userController.delete);

  console.log("✅ userController OK");
} catch (error) {
  console.error("❌ ERREUR dans userController:", error.message);
  console.error(error.stack);

  // Fallback routes
  apiRouter.get("/users", (req, res) => {
    res.json({ message: "Users route OK (fallback)" });
  });
}

try {
  // Test 3: QuestionController
  console.log("3️⃣ Test questionController...");
  const questionController = require("./src/controllers/questionController");

  apiRouter.get("/questions", questionController.index);
  apiRouter.get("/questions/:id", questionController.show);
  apiRouter.post("/questions", questionController.create);
  apiRouter.put("/questions/:id", questionController.update);
  apiRouter.delete("/questions/:id", questionController.delete);

  console.log("✅ questionController OK");
} catch (error) {
  console.error("❌ ERREUR dans questionController:", error.message);
  console.error(error.stack);

  // Fallback routes
  apiRouter.get("/questions", (req, res) => {
    res.json({ message: "Questions route OK (fallback)" });
  });
  apiRouter.get("/questions/:id", (req, res) => {
    res.json({ message: `Question ${req.params.id} OK (fallback)` });
  });
}

try {
  // Test 4: QuizController
  console.log("4️⃣ Test quizController...");
  const quizController = require("./src/controllers/quizController");

  apiRouter.get("/quizzes", quizController.index);
  apiRouter.get("/quizzes/:id", quizController.show);
  apiRouter.post("/quizzes", quizController.create);
  apiRouter.put("/quizzes/:id", quizController.update);
  apiRouter.delete("/quizzes/:id", quizController.delete);
  apiRouter.post("/quizzes/:id/duplicate", quizController.duplicate);

  console.log("✅ quizController OK");
} catch (error) {
  console.error("❌ ERREUR dans quizController:", error.message);
  console.error(error.stack);

  // Fallback routes pour les quiz
  apiRouter.get("/quizzes", (req, res) => {
    res.json({ 
      message: "Quizzes route OK (fallback)",
      // Données de test temporaires pour déboguer votre frontend
      data: [
        {
          id: 1,
          title: "Quiz Test",
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

// ===== ROUTES PROTÉGÉES PAR RÔLE =====
console.log("🔐 Configuration des routes protégées par rôle...");

try {
  // ✅ CORRECTION: ROUTE PROFIL avec accessLevel dynamique basé sur le rôle
  apiRouter.get("/profil", protect, (req, res) => {
    // Déterminer le niveau d'accès basé sur le rôle
    let accessLevel;
    switch(req.user.role) {
      case "admin":
        accessLevel = "admin";
        break;
      case "user":
        accessLevel = "user";
        break;
      default:
        accessLevel = "profil"; // fallback pour les rôles inconnus
    }

    res.json({
      success: true,
      message: "Accès au profil autorisé",
      data: {
        user: req.user,
        accessLevel: accessLevel // ✅ Maintenant dynamique !
      }
    });
  });

  // ROUTE ADMIN - Accessible uniquement aux administrateurs
  apiRouter.get("/admin", protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Accès admin autorisé",
      data: {
        user: req.user,
        accessLevel: "admin",
        adminFeatures: [
          "Gestion des utilisateurs",
          "Gestion des quiz",
          "Statistiques globales"
        ]
      }
    });
  });

  // ROUTES SUPPLÉMENTAIRES POUR L'ESPACE ADMIN
  
  // Dashboard admin
  apiRouter.get("/admin/dashboard", protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Dashboard admin",
      data: {
        stats: {
          totalUsers: 0, // À remplacer par de vraies données
          totalQuizzes: 0,
          totalQuestions: 0
        }
      }
    });
  });

  // Gestion des utilisateurs pour les admins
  apiRouter.get("/admin/users", protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Liste des utilisateurs (admin)",
      data: {
        users: [] // Ici vous pouvez appeler votre userController
      }
    });
  });

  // Modifier le rôle d'un utilisateur (admin seulement)
  apiRouter.put("/admin/users/:id/role", protect, authorize("admin"), async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Rôle invalide"
        });
      }

      // Empêcher un admin de se retirer ses propres droits admin
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

      res.json({
        success: true,
        message: `Rôle modifié avec succès`,
        data: {
          user: user.toPublicJSON()
        }
      });

    } catch (error) {
      console.error("Erreur modification rôle:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur"
      });
    }
  });

  // ROUTE DE VÉRIFICATION DES PERMISSIONS
  apiRouter.get("/check-permissions", protect, (req, res) => {
    const permissions = {
      canAccessProfil: true, // Tous les utilisateurs connectés
      canAccessAdmin: req.user.role === "admin",
      currentRole: req.user.role
    };

    res.json({
      success: true,
      data: permissions
    });
  });

  console.log("✅ Routes protégées configurées :");
  console.log("  GET  /api/profil (🔒 user + admin)");
  console.log("  GET  /api/admin (🔒 admin uniquement)");
  console.log("  GET  /api/admin/dashboard (🔒 admin uniquement)");
  console.log("  GET  /api/admin/users (🔒 admin uniquement)");
  console.log("  PUT  /api/admin/users/:id/role (🔒 admin uniquement)");
  console.log("  GET  /api/check-permissions (🔒 tous connectés)");

} catch (error) {
  console.error("❌ ERREUR dans la configuration des routes protégées:", error.message);
}

// Appliquer le routeur avec le préfixe /api (si pas déjà fait avec authRoutes)
app.use("/api", apiRouter);

console.log("🎉 Tous les contrôleurs testés !");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🌐 CORS autorisé pour:");
  console.log("  - http://localhost:5173 (Vite dev)");
  console.log("  - https://hackathon-quiz-4g3a.onrender.com (Production)");
  console.log("📋 Routes disponibles:");
  
  console.log("\n🔓 Routes publiques:");
  console.log("  POST /api/register");
  console.log("  POST /api/login");
  console.log("  POST /api/logout");
  console.log("  GET  /api/verify/:token");
  console.log("  POST /api/resend-verification");
  console.log("  POST /api/password-reset-request");
  console.log("  POST /api/reset-password");
  
  console.log("\n🔒 Routes protégées (connecté):");
  console.log("  GET  /api/me");
  console.log("  GET  /api/profil (user + admin) ✅ accessLevel dynamique");
  console.log("  GET  /api/check-permissions");
  
  console.log("\n👑 Routes admin uniquement:");
  console.log("  GET  /api/admin");
  console.log("  GET  /api/admin/dashboard");
  console.log("  GET  /api/admin/users");
  console.log("  PUT  /api/admin/users/:id/role");
  
  console.log("\n📊 Routes API générales:");
  console.log("  GET  /api/users");
  console.log("  GET  /api/questions");
  console.log("  GET  /api/quizzes");
});