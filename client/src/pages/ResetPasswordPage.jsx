import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/ResetPasswordPage.css'

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Vérification du token au chargement
  useEffect(() => {
    if (!token) {
      setError("Token manquant dans l'URL. Veuillez utiliser le lien complet depuis votre email.");
    } else {
      console.log("Token reçu dans l'URL:", token.substring(0, 20) + "...");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    // Validation côté client
    if (!token) {
      setError("Token manquant dans l'URL.");
      setIsLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Envoi de la requête de réinitialisation...");
      console.log("Token utilisé:", token.substring(0, 20) + "...");
      
      // Requête vers la nouvelle route avec token dans l'URL
      const response = await axios.post(`http://localhost:3001/api/reset-password/${token}`, {
        password: newPassword,        // Le serveur convertira en "newPassword"
        confirmPassword: confirmPassword
      });
     
      console.log("Réponse de l'API:", response.data);
      
      setMessage("Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...");
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter." 
          }
        });
      }, 3000);
      
    } catch (err) {
      console.error("Erreur complète:", err);
      
      setIsLoading(false);
      
      // Gestion détaillée des erreurs
      if (err.response?.data?.message) {
        // Utiliser le message d'erreur du serveur
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Token invalide ou données incorrectes. Veuillez vérifier votre saisie.");
      } else if (err.response?.status === 404) {
        setError("Token expiré ou non trouvé. Demandez un nouveau lien de réinitialisation.");
      } else if (err.response?.status === 500) {
        setError("Erreur serveur. Veuillez réessayer plus tard.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleRequestNewReset = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-wrapper">
        <form onSubmit={handleSubmit} className="reset-password-form">
          <h2>Réinitialiser le mot de passe</h2>
          
          {/* Informations sur le token */}
          {token && (
            <div className="token-info">
              <p>Token détecté: {token.substring(0, 10)}...</p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Entrez votre nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
            <small>Au moins 6 caractères</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirmez votre nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !token}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="reset-password-actions">
          <button 
            type="button" 
            onClick={handleBackToLogin}
            className="secondary-button"
          >
            Retour à la connexion
          </button>
          
          {error && error.includes("expiré") && (
            <button 
              type="button" 
              onClick={handleRequestNewReset}
              className="secondary-button"
            >
              Demander un nouveau lien
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;