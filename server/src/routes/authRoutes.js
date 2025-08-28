const express = require("express");
const {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  me, // Récupérer l'utilisateur connecté
} = require("../controllers/authController");

const { protect, authorize } = require("../middlewares/authMiddleware"); // ✅ Import des middlewares

const router = express.Router();

// ======================
// 📌 Routes publiques
// ======================
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/password-reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resend-verification", resendVerificationEmail);

// ======================
// 🔒 Routes protégées
// ======================

// ✅ Profil accessible aux utilisateurs connectés (user OU admin)
router.get("/profil", protect, me);

// ✅ Page admin accessible uniquement aux admins
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Bienvenue sur la page admin",
    user: req.user,
  });
});

module.exports = router;
