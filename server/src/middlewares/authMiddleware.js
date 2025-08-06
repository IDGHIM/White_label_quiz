const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  const token = req.cookies.token || "";

  if (!token) {
    return res
      .status(401)
      .json({ message: `Authentification échouée, token manquant` });
  }

  try {
    // Vérification du token
    const decode = jwt.verify(token, JWT_SECRET);
    req.role = decode;
  } catch (error) {
    return res.status(401).json({ message: `Token expiré ou invalide` });
  }
  next();
};

// Middleware pour la gestion des rôles utilisateur
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: `Non authentifié` });

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Accès refusé. Rôle insuffisant` });
    }
    next();
  };

module.exports = { protect, authorize };
