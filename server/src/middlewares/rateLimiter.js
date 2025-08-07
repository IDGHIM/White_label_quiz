const rateLimit = require("express-rate-limit");

// Fonction qui limite le nombre de tentatives de connexion
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limite à 5 tentatives e login par IP
  standardHearders: "draft-8",
  legacyHeaders: false,
  message: {
    message: `Trop de tentatives de connexion, veuillez réessayer dans 15 minutes`,
  },
});

module.exports = rateLimit;
