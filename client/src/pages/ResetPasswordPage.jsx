import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token manquant dans l'URL.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await axios.post('https://hackathon-quiz-backend.onrender.com/api/reset-password', {
        token,
        password: newPassword,
        confirmPassword,
      });
     
      console.log("Réponse de l'API:", response.data);
      setMessage("Mot de passe mis à jour avec succès.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Erreur complète:", err);
      setError("Lien invalide ou expiré.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <h2>Réinitialiser le mot de passe</h2>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmer nouveau mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button type="submit">Réinitialiser</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default ResetPasswordPage;