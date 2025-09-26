const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

// Fonction pour s'enregistrer
async function register(req, res) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: `Tous les champs sont obligatoires` });
    }

    if (password != confirmPassword) {
      return res
        .status(400)
        .json({ message: `Les mots de passe doivent être identiques` });
    }

    // Vérifier aussi si le username existe
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: `Email est déjà utilisé` });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: `Nom d'utilisateur est déjà utilisé` });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    await newUser.save();

    // Génération du token de vérification par email qui expire au bout d'une heure
    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationUrl = `http://localhost:5173/api/verify/${verificationToken}`;

    await sendMail({
      to: newUser.email,
      subject: "Vérification email",
      html: `Bonjour ${username}, <br>. Merci de vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}"> Vérifier mon compte</a> <br> Ce lien expire dans une heure`,
    });

    return res.status(201).json({
      message: `Utilisateur créé avec succès. Veuillez vérifier votre email`,
    });
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement`, error);
    res.status(500).json({ message: `Impossible de s'enregistrer` });
  }
}

// Connexion au compte
async function login(req, res) {
  console.log("Requête login reçue:", req.body);
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      console.log("Champs manquants");
      return res.status(400).json({ message: `Tous les champs sont requis` });
    }

    // Recherche améliorée par email OU username
    let user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    
    console.log("Utilisateur trouvé :", user ? 'OUI' : 'NON');

    if (!user) {
      console.log("Utilisateur introuvable");
      return res.status(401).json({ message: `Identifiants incorrects` });
    }

    if (!user.password) {
      console.log("Mot de passe manquant en DB");
      return res.status(400).json({ message: "Mot de passe manquant." });
    }

    if (!user.isVerified) {
      console.log("Compte non vérifié");
      return res
        .status(401)
        .json({ message: `Veuillez confirmer votre compte` });
    }

    console.log("Vérification du mot de passe...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Mot de passe valide :", isMatch);

    if (!isMatch) {
      console.log("Mot de passe incorrect");
      return res
        .status(401)
        .json({ message: `Identifiants incorrects` });
    }

    console.log("Connexion réussie pour:", user.username);

    // Création du token. Expiration de la session au bout d'une heure
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envoi du token dans les cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      message: `Connexion réussie`,
      user: {
        id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: `Erreur serveur` });
  }
}

// Fonction me
const me = async (req, res) => {
  try {
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpiration');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Retourner les informations de l'utilisateur
    res.status(200).json({
      success: true,
      message: "Informations utilisateur récupérées avec succès",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des informations utilisateur",
      error: error.message
    });
  }
};

// Fonction de reset du password - DEMANDE
async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ message: `Tous les champs sont obligatoires` });
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // SÉCURITÉ: Ne pas révéler si l'email existe ou non
      return res.json({ message: `Si cet email existe, un lien de réinitialisation a été envoyé` });
    }

    console.log('Génération du token de réinitialisation pour:', email);
    
    // Génération du token original (celui qui sera dans l'URL/email)
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log('Token original généré:', resetToken);
    
    // Hash du token (celui qui sera stocké en DB)
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log('Token hashé (pour DB):', resetTokenHash);

    // Stockage en DB
    user.resetToken = resetTokenHash;
    user.resetTokenExpiration = Date.now() + 3600000; // 1h
    await user.save();
    
    console.log('Token hashé sauvegardé en DB pour:', user.email);

    // URL avec le token ORIGINAL (non hashé)
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
    console.log('URL générée:', resetUrl);

    await sendMail({
      to: user.email,
      subject: `Réinitialisation du mot de passe`,
      html: `Bonjour ${user.username},<br><br>Vous avez demandé une réinitialisation de votre mot de passe.<br><br>Cliquez sur ce lien pour créer un nouveau mot de passe : <a href="${resetUrl}">Réinitialiser mon mot de passe</a><br><br>Ce lien expire dans 1 heure.<br><br>Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.`,
    });

    console.log('Email envoyé avec succès');
    
    res.json({ message: `Si cet email existe, un lien de réinitialisation a été envoyé` });
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    res.status(500).json({ message: `Erreur lors de l'envoi de l'email` });
  }
}

// Fonction de reset du password - EXECUTION
async function resetPassword(req, res) {
  console.log('===== DEBUG RESET PASSWORD =====');
  console.log('Params reçus:', req.params);
  console.log('Body reçu:', req.body);
  
  // CORRECTION: Récupérer le token depuis req.params (URL) au lieu de req.body
  const { token } = req.params;
  const { password, newPassword, confirmPassword } = req.body;
  
  console.log('Token depuis URL:', token ? token.substring(0, 20) + '...' : 'Absent');
  console.log('Password:', password ? 'Présent' : 'Absent');
  console.log('NewPassword:', newPassword ? 'Présent' : 'Absent');
  console.log('ConfirmPassword:', confirmPassword ? 'Présent' : 'Absent');

  // Utiliser soit 'password' soit 'newPassword' (compatibilité)
  const actualPassword = password || newPassword;

  if (!token) {
    console.log('Token manquant dans l\'URL');
    return res.status(400).json({ message: `Token requis` });
  }

  if (!actualPassword || !confirmPassword) {
    console.log('Mot de passe ou confirmation manquant');
    return res.status(400).json({ message: `Tous les champs sont obligatoires` });
  }

  if (actualPassword !== confirmPassword) {
    console.log('Mots de passe ne correspondent pas');
    return res.status(400).json({ message: `Les mots de passe ne sont pas identiques` });
  }

  // Validation de la force du mot de passe
  if (actualPassword.length < 6) {
    console.log('Mot de passe trop court');
    return res.status(400).json({ message: `Le mot de passe doit contenir au moins 6 caractères` });
  }

  try {
    console.log('Hashage du token reçu depuis l\'URL...');
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    console.log('Token original:', token.substring(0, 20) + '...');
    console.log('Token hashé pour recherche:', resetTokenHash.substring(0, 20) + '...');

    console.log('Recherche utilisateur avec token hashé...');
    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.log('Aucun utilisateur trouvé avec ce token ou token expiré');
      
      // Debug: chercher si le token existe même s'il est expiré
      const expiredUser = await User.findOne({ resetToken: resetTokenHash });
      if (expiredUser) {
        console.log('Token trouvé mais expiré pour:', expiredUser.email);
        console.log('Expiration:', new Date(expiredUser.resetTokenExpiration));
        console.log('Maintenant:', new Date());
        return res.status(400).json({ message: `Token expiré` });
      } else {
        console.log('Token totalement introuvable en DB');
      }
      
      return res.status(400).json({ message: `Token invalide ou expiré` });
    }

    console.log('Utilisateur trouvé:', user.email);
    console.log('Token valide, mise à jour du mot de passe...');

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(actualPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
    
    console.log(`Mot de passe réinitialisé avec succès pour: ${user.email}`);
    
    res.json({ 
      success: true,
      message: `Mot de passe réinitialisé avec succès` 
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    res.status(500).json({ 
      success: false,
      message: `Erreur lors de la réinitialisation` 
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: `Déconnecté avec succès` });
  } catch (error) {
    console.error(`Erreur lors de déconnexion`, error);
    res.status(500).json({ message: `Erreur lors de la déconnexion` });
  }
}

// Vérification du compte via un token envoyé par mail
async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      return res.status(400).json({ message: `Token invalide` });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: `Utilisateur introuvable` });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: `Compte déjà vérifié` });
    }

    user.isVerified = true;
    await user.save();
    
    console.log(`Compte vérifié pour: ${user.email}`);
    res.json({ message: `Compte vérifié avec succès` });
  } catch (error) {
    console.error(`Erreur vérification email:`, error);
    
    // Messages d'erreur plus spécifiques
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: `Lien de vérification expiré` });
    }
    
    res.status(400).json({ message: `Token invalide ou expiré` });
  }
}

async function resendVerificationEmail(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Ce compte est déjà vérifié." });
    }

    const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const verificationUrl = `http://localhost:5173/api/verify/${verificationToken}`;

    await sendMail({
      to: user.email,
      subject: "Nouveau lien de vérification",
      html: `Bonjour ${user.username},<br><br>Voici un nouveau lien pour vérifier votre compte : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 24h.`,
    });

    res.json({
      message: "Un nouveau lien de vérification a été envoyé à votre email.",
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de l'email :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'envoi du lien de vérification." });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};