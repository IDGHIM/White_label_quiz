const express = require("express");
const {login,logout,register,requestPasswordReset,resetPassword,verifyEmail,resendVerificationEmail, me, // Nouvelle fonction pour récupérer l'utilisateur connecté
} = require("../controllers/authController");
// ✅ CORRECTION: Chemin d'import corrigé (middleware au singulier)

const { protect } = require("../middlewares/authMiddleware"); // Import du middleware

const router = express.Router();
// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/password-reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resend-verification", resendVerificationEmail); // ✅ CORRECTION: nom cohérent
// Route protégée pour récupérer l'utilisateur connecté
router.get("/me", protect, me);
module.exports = router;