const mongoose = require('mongoose');

//Définition du schéma pour les utilisateurs
const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetToken: { type: String, default: null },
  resetTokenExpiration: { type: Date, default: null }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;