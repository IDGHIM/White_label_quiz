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
try {
  console.log("🔐 Test authMiddleware...");
  const authMiddleware = require("./src/middlewares/authMiddleware");
  protect = authMiddleware.protect; // ✅ CORRECTION: utiliser 'protect' au lieu de 'authenticateToken'
  console.log("✅ authMiddleware OK - protect function loaded");
} catch (error) {
  console.error("❌ ERREUR dans authMiddleware:", error.message);
  // Fallback middleware simple si le fichier n'existe pas
  protect = (req, res, next) => {
    res.status(501).json({ message: "Middleware d'authentification non disponible" });
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

// Appliquer le routeur avec le préfixe /api (si pas déjà fait avec authRoutes)
app.use("/api", apiRouter);

console.log("🎉 Tous les contrôleurs testés !");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🌐 CORS autorisé pour:");
  console.log("  - http://localhost:5173 (Vite dev)");
  console.log("  - https://hackathon-quiz-4g3a.onrender.com (Production)");
  console.log("📋 Routes disponibles:");
  console.log("  POST /api/register");
  console.log("  POST /api/login");
  console.log("  POST /api/logout");
  console.log("  GET  /api/me (🔒 protégée)");
  console.log("  GET  /api/verify/:token");
  console.log("  POST /api/resend-verification");
  console.log("  POST /api/password-reset-request");
  console.log("  POST /api/reset-password");
  console.log("  GET  /api/users");
  console.log("  GET  /api/questions");
  console.log("  GET  /api/quizzes");
});