const express = require("express");
const {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/password-reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resendVerificationEmail", resendVerificationEmail);

module.exports = router;
