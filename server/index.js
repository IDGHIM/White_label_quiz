const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/database/database");
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: "https://hackathon-quiz-4g3a.onrender.com",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connexion DB
connectDB();

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API fonctionnel!' });
});

// Créer un routeur pour l'API
const apiRouter = express.Router();

// ===== ÉTAPE 1: TESTER LES CONTRÔLEURS UN PAR UN =====
console.log('🧪 Phase de test - Intégration progressive...');

try {
  // Test 1: AuthController
  console.log('1️⃣ Test authController...');
  const authController = require("./src/controllers/authController");
 
  // Routes auth avec préfixe /api
  apiRouter.post('/register', authController.register);
  apiRouter.post('/login', authController.login);
  apiRouter.post('/logout', authController.logout);
  apiRouter.post('/password-reset-request', authController.requestPasswordReset);
  apiRouter.post('/reset-password', authController.resetPassword);
 
  console.log('✅ authController OK');
} catch (error) {
  console.error('❌ ERREUR dans authController:', error.message);
  console.error(error.stack);
  process.exit(1);
}

try {
  // Test 2: UserController
  console.log('2️⃣ Test userController...');
  const userController = require("./src/controllers/userController");
 
  apiRouter.get('/users', userController.index);
  apiRouter.get('/users/:id', userController.show);
  apiRouter.post('/users', userController.create);
  apiRouter.put('/users/:id', userController.update);
  apiRouter.delete('/users/:id', userController.delete);
 
  console.log('✅ userController OK');
} catch (error) {
  console.error('❌ ERREUR dans userController:', error.message);
  console.error(error.stack);
 
  // Fallback routes
  apiRouter.get('/users', (req, res) => {
    res.json({ message: 'Users route OK (fallback)' });
  });
}

try {
  // Test 3: QuestionController
  console.log('3️⃣ Test questionController...');
  const questionController = require("./src/controllers/questionController");
 
  apiRouter.get('/questions', questionController.index);
  apiRouter.get('/questions/:id', questionController.show);
  apiRouter.post('/questions', questionController.create);
  apiRouter.put('/questions/:id', questionController.update);
  apiRouter.delete('/questions/:id', questionController.delete);
 
  console.log('✅ questionController OK');
} catch (error) {
  console.error('❌ ERREUR dans questionController:', error.message);
  console.error(error.stack);
 
  // Fallback routes
  apiRouter.get('/questions', (req, res) => {
    res.json({ message: 'Questions route OK (fallback)' });
  });
  apiRouter.get('/questions/:id', (req, res) => {
    res.json({ message: `Question ${req.params.id} OK (fallback)` });
  });
}

try {
  // Test 4: QuizController
  console.log('4️⃣ Test quizController...');
  const quizController = require("./src/controllers/quizController");
 
  apiRouter.get('/quizzes', quizController.index);
  apiRouter.get('/quizzes/:id', quizController.show);
  apiRouter.post('/quizzes', quizController.create);
  apiRouter.put('/quizzes/:id', quizController.update);
  apiRouter.delete('/quizzes/:id', quizController.delete);
  apiRouter.post('/quizzes/:id/duplicate', quizController.duplicate);
 
  console.log('✅ quizController OK');
} catch (error) {
  console.error('❌ ERREUR dans quizController:', error.message);
  console.error(error.stack);
 
  // Fallback routes
  apiRouter.get('/quizzes', (req, res) => {
    res.json({ message: 'Quizzes route OK (fallback)' });
  });
}

// Appliquer le routeur avec le préfixe /api
app.use('/api', apiRouter);

console.log('🎉 Tous les contrôleurs testés !');

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📋 Routes disponibles:');
  console.log('  POST /api/register');
  console.log('  POST /api/login');
  console.log('  POST /api/logout');
  console.log('  GET  /api/users');
  console.log('  GET  /api/questions');
  console.log('  GET  /api/quizzes');
});