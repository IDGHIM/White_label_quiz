import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email ou username
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!identifier.trim()) {
      setMessage('Veuillez saisir votre email ou nom d\'utilisateur');
      return;
    }
    
    if (!password.trim()) {
      setMessage('Veuillez saisir votre mot de passe');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    console.log('🚀 [LOGIN] Tentative de connexion...');
    console.log('🚀 [LOGIN] Identifier:', identifier);

    try {
      console.log('🌐 [LOGIN] Envoi de la requête vers l\'API...');
      
      const response = await axios.post('http://localhost:3001/api/login', {
        identifier: identifier.trim(),
        password: password,
      }, {
        withCredentials: true, // Important pour les cookies
        timeout: 10000 // Timeout de 10 secondes
      });

      console.log('✅ [LOGIN] Connexion réussie:', response.data);
      
      // ✅ NOUVEAU: Récupérer le rôle de l'utilisateur depuis la réponse
      const userRole = response.data.user?.role || response.data.data?.user?.role;
      console.log('👤 [LOGIN] Rôle utilisateur détecté:', userRole);

      // ✅ NOUVEAU: Déterminer la destination selon le rôle
      let redirectPath = '/profil'; // Par défaut pour les users
      let redirectMessage = 'Connexion réussie ! Redirection vers votre profil...';

      if (userRole === 'admin') {
        redirectPath = '/admin';
        redirectMessage = 'Connexion réussie ! Redirection vers l\'espace admin...';
      }

      console.log('🎯 [LOGIN] Redirection prévue vers:', redirectPath);
      setMessage(redirectMessage);
      
      // ✅ CORRECTION: Rafraîchir la navbar IMMÉDIATEMENT
      if (window.refreshNavbarAuth) {
        console.log('🔄 [LOGIN] Rafraîchissement de la navbar...');
        try {
          await window.refreshNavbarAuth();
          console.log('✅ [LOGIN] Navbar mise à jour avec succès');
        } catch (navError) {
          console.error('⚠️ [LOGIN] Erreur lors du rafraîchissement de la navbar:', navError);
        }
      } else {
        console.warn('⚠️ [LOGIN] window.refreshNavbarAuth non disponible');
      }

      // ✅ NOUVEAU: Redirection conditionnelle selon le rôle
      setTimeout(() => {
        console.log('🔄 [LOGIN] Redirection vers:', redirectPath);
        navigate(redirectPath);
      }, 1000);

    } catch (error) {
      console.error('❌ [LOGIN] Erreur complète:', error);
      
      if (error.response) {
        // Erreur HTTP (400, 401, 500, etc.)
        console.error('🔥 [LOGIN] Erreur serveur:', {
          status: error.response.status,
          message: error.response.data?.message,
          data: error.response.data
        });
        
        const errorMessage = error.response.data?.message || 'Erreur serveur';
        
        switch (error.response.status) {
          case 400:
            setMessage('Données invalides. Vérifiez vos informations.');
            break;
          case 401:
            setMessage('Identifiants incorrects. Vérifiez votre email/nom d\'utilisateur et mot de passe.');
            break;
          case 403:
            setMessage('Compte non vérifié. Vérifiez vos emails ou contactez le support.');
            break;
          case 429:
            setMessage('Trop de tentatives. Veuillez réessayer plus tard.');
            break;
          case 500:
            setMessage('Erreur serveur. Veuillez réessayer plus tard.');
            break;
          default:
            setMessage(`Erreur ${error.response.status}: ${errorMessage}`);
        }
      } else if (error.request) {
        // Erreur réseau
        console.error('🌐 [LOGIN] Erreur réseau:', error.request);
        setMessage('Impossible de joindre le serveur. Vérifiez votre connexion internet.');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        setMessage('La requête a pris trop de temps. Veuillez réessayer.');
      } else {
        // Erreur inconnue
        console.error('❓ [LOGIN] Erreur inconnue:', error.message);
        setMessage(`Erreur inattendue: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">Connectez-vous à votre compte</p>
          
          {/* Champ Identifiant */}
          <div className="input-group">
            <label htmlFor="identifier" className="input-label">
              Email ou nom d'utilisateur
            </label>
            <input
              id="identifier"
              className="login-input"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (message) clearMessage(); // Effacer le message d'erreur lors de la saisie
              }}
              placeholder="Entrez votre email ou nom d'utilisateur"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          {/* Champ Mot de passe */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Mot de passe
            </label>
            <div className="password-input-container">
              <input
                id="password"
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (message) clearMessage();
                }}
                placeholder="Entrez votre mot de passe"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          
          {/* Bouton de soumission */}
          <button 
            type="submit" 
            className={`login-submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !identifier.trim() || !password.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
          
          {/* Message de statut */}
          {message && (
            <div className={`login-message ${message.includes('Erreur') || message.includes('Impossible') ? 'error' : 'success'}`}>
              <span>{message}</span>
              {message.includes('Erreur') && (
                <button 
                  type="button" 
                  className="message-close"
                  onClick={clearMessage}
                  aria-label="Fermer le message"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Liens utiles */}
          <div className="login-links">
            <Link to="/forgot-password" className="forgot-password-link">
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="register-link">
            <p>
              Pas encore de compte ? 
              <Link to="/register" className="register-link-text">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Section de debug (à supprimer en production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
              <details>
                <summary>🔧 Informations de debug</summary>
                <div className="debug-content">
                  <p><strong>Identifier:</strong> {identifier || 'vide'}</p>
                  <p><strong>Password:</strong> {password ? '***' : 'vide'}</p>
                  <p><strong>Loading:</strong> {isLoading ? 'OUI' : 'NON'}</p>
                  <p><strong>Message:</strong> {message || 'aucun'}</p>
                  <p><strong>NavbarAuth disponible:</strong> {window.refreshNavbarAuth ? 'OUI' : 'NON'}</p>
                  <small>Vérifiez la console pour plus de détails</small>
                </div>
              </details>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;