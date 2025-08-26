const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
  let token;
  
  // Vérifier le token dans les cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Vérifier le token dans l'en-tête Authorization
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentification échouée, token manquant"
    });
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("🔍 Token décodé:", decoded);
    
    // ✅ CORRECTION: Utiliser findByIdPublic du modèle User
    const user = await User.findByIdPublic(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // ✅ CORRECTION: Vérifier que le compte est vérifié
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Compte non vérifié"
      });
    }
    
    // ✅ CORRECTION: Utiliser les données de la DB (plus fiables) avec fallback sur le token
    req.user = {
      id: user._id.toString(), // ✅ Convertir ObjectId en string
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log("✅ Utilisateur authentifié:", req.user.username);
    next();
  } catch (error) {
    console.error("❌ Erreur de vérification du token:", error.message);
    
    // ✅ Messages d'erreur plus spécifiques
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expiré"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token invalide"
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Token expiré ou invalide"
    });
  }
};

// Middleware pour la gestion des rôles utilisateur
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Non authentifié"
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Accès refusé. Rôle insuffisant"
    });
  }

  next();
};

// ✅ Middleware optionnel pour récupérer l'utilisateur si token présent
const optionalAuth = async (req, res, next) => {
  let token;
  
  // Vérifier le token dans les cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Vérifier le token dans l'en-tête Authorization
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si pas de token, continuer sans authentification
  if (!token) {
    return next();
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Utiliser la même logique que dans protect
    let user;
    if (User.findByIdPublic) {
      user = await User.findByIdPublic(decoded.id);
    } else {
      user = await User.findById(decoded.id).select('-password -resetToken -resetTokenExpiration');
    }
    
    if (user && user.isVerified) {
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    console.log("Token optionnel invalide, continuons sans auth:", error.message);
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };