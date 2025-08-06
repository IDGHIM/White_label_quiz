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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: `Email est déjà utilisé` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    await newUser.save();

    const CLIENT_URL = process.env.CLIENT_URL;

    // Génération du token de vérification par email qui expire au bout d'une heure
    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationUrl = `${CLIENT_URL}/auth/verify/${verificationToken}`;

    await sendMail({
      to: newUser.email,
      subject: "Vérification email",
      html: `Bonjour${username}, <br>. Merci de vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}"> Vérifier mon compte</a> <br> Ce lien expire dans une heure`,
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
  console.log("✅ Requête login reçue:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("❌ Champs manquants");
      return res.status(400).json({ message: `Tous les champs sont requis` });
    }

    const user = await User.findOne({ email });
    console.log("👤 Utilisateur trouvé :", user);

    if (!user) {
      console.log("❌ Utilisateur introuvable");
      return res.status(400).json({ message: `Utilisateur introuvable` });
    }

    if (!user.isVerified) {
      console.log("⚠️ Compte non vérifié");
      return res
        .status(401)
        .json({ message: `Veuillez confirmer votre compte` });
    }

    console.log("🔐 Vérification du mot de passe...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ Mot de passe valide :", isMatch);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: `Email ou mot de passe incorrect` });
    }

    // Création du token,. Expiration de la session au bout d'une heure
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envoi du token dans les cookies
    res.cookie("token", token, {
      httponly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      message: `Connexion réussie`,
      user: {
        id: user._id,
        role: user.role,
        username: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erreur serveur` });
  }
}

// Fonction de reset du password
async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ message: `Tous les champs sont obligatoires` });
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `Utilisateur introuvable` });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1h
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: `Réinitialisation du mot de passe`,
      html: `<a href ="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: `Email de réinitialisation envoyé` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erreur` });
  }
}

async function resetPassword(req, res) {
  const { token, password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return res
      .status(400)
      .json({ message: `Tous les champs sont obligatoires` });

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ message: `Les mots de passe ne sont pas identiques` });

  try {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: `Token invalide ou expiré` });

    // On hash un nouveau mot de passe
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ message: `Mot de passe réinitialisé avec succès` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erreur` });
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

// ----------------------------------------------------------------- //
// ----------------------------------------------------------------- //

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
    res.json({ message: `Compte vérifié avec succès` });
  } catch (error) {
    console.error(`Erreur`);
    res.status(400).json({ message: `Token invalide ou expiré` });
  }
}

async function resendVerificationEmail(req, res) {
  const { email } = req.body;

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

    // ----------------------------------------------------------------- //
    // ----------------------------------------------------------------- //

    const verificationUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Nouveau lien de vérification",
      html: `Bonjour ${user.name},<br><br>Voici un nouveau lien pour vérifier votre compte : <a href="${verificationUrl}">Vérifier mon compte</a><br><br>Ce lien est valable 24h.`,
    });

    res.json({
      message: "Un nouveau lien de vérification a été envoyé à votre email.",
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de l’email :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l’envoi du lien de vérification." });
  }
}

module.exports = {
  register,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
