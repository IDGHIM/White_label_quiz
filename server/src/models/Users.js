const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Définition du schéma pour les utilisateurs
const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String, default: null },
  resetTokenExpiration: { type: Date, default: null },
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Avant de sauvegarder : hash le mot de passe
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const hash = await bcrypt.hash(this.password, 10);
//     this.password = hash;
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Méthode pour comparer le mot de passe
// UserSchema.methods.comparePassword = function (password) {
//   return bcrypt.compare(password, this.password);
// };

// Méthode pour retourner les données utilisateur sans le mot de passe
UserSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.resetTokenExpiration;
  return user;
};

// Méthode statique pour trouver un utilisateur par ID sans le mot de passe
UserSchema.statics.findByIdPublic = function(id) {
  return this.findById(id).select('-password -resetToken -resetTokenExpiration');
};

const User = mongoose.model("User", UserSchema);
module.exports = User;