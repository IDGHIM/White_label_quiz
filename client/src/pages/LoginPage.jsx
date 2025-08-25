import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email ou username
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    console.log('🚀 [FRONTEND] Tentative de connexion...');
    console.log('🚀 [FRONTEND] Identifier:', identifier);
    console.log('🚀 [FRONTEND] Password:', password ? '***' : 'VIDE');

    try {
      console.log('🌐 [FRONTEND] Envoi de la requête vers:', 'http://localhost:3001/api/login');
      
      const response = await axios.post('http://localhost:3001/api/login', {
        identifier,
        password,
      }, {
        withCredentials: true, // Pour les cookies
      });

      console.log('✅ [FRONTEND] Réponse reçue:', response.data);
      console.log('✅ [FRONTEND] Status:', response.status);

      setMessage('Connexion réussie ! Redirection...');
      
      // Stockage des données utilisateur si nécessaire
      if (response.data.user) {
        console.log('👤 [FRONTEND] Données utilisateur:', response.data.user);
        // localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      if (response.data.token) {
        console.log('🔑 [FRONTEND] Token reçu');
        // localStorage.setItem('token', response.data.token);
      }

      setTimeout(() => {
        navigate('/profil'); // ou la page de destination
      }, 1500);

    } catch (error) {
      console.error('❌ [FRONTEND] Erreur complète:', error);
      console.error('❌ [FRONTEND] Response data:', error.response?.data);
      console.error('❌ [FRONTEND] Response status:', error.response?.status);
      console.error('❌ [FRONTEND] Response headers:', error.response?.headers);
      
      if (error.response) {
        // Erreur HTTP (400, 401, 500, etc.)
        console.error('🔥 [FRONTEND] Erreur serveur:', {
          status: error.response.status,
          message: error.response.data?.message,
          data: error.response.data
        });
        
        setMessage(`Erreur ${error.response.status}: ${error.response.data?.message || 'Erreur serveur'}`);
        
        // Gestion spécifique des erreurs
        switch (error.response.status) {
          case 401:
            console.warn('🚫 [FRONTEND] Erreur d\'authentification - Vérifiez vos identifiants');
            break;
          case 400:
            console.warn('⚠️ [FRONTEND] Données invalides');
            break;
          case 500:
            console.warn('💥 [FRONTEND] Erreur serveur interne');
            break;
          default:
            console.warn('❓ [FRONTEND] Erreur inconnue');
        }
      } else if (error.request) {
        // Erreur réseau
        console.error('🌐 [FRONTEND] Erreur réseau:', error.request);
        setMessage('Erreur réseau: Impossible de joindre le serveur');
      } else {
        // Erreur inconnue
        console.error('❓ [FRONTEND] Erreur inconnue:', error.message);
        setMessage(`Erreur: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Se connecter</h2>
        
        <input
          className="login-input"
          type="text"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            console.log('📝 [FRONTEND] Identifier changé:', e.target.value);
          }}
          placeholder="Email ou nom d'utilisateur"
          required
          disabled={isLoading}
        />
        
        <input
          className="login-input"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            console.log('📝 [FRONTEND] Password changé:', e.target.value ? '***' : 'vide');
          }}
          placeholder="Mot de passe"
          required
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="login-submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
        
        {message && (
          <p className={`login-message ${message.includes('Erreur') ? 'error' : 'success'}`}>
            {message}
          </p>
        )}

        {/* Logs visibles pour le debug */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto',
          border: '1px solid #ddd'
        }}>
          <strong>🔧 Debug Info:</strong><br/>
          Identifier: {identifier || 'vide'}<br/>
          Password: {password ? '***' : 'vide'}<br/>
          Loading: {isLoading ? 'OUI' : 'NON'}<br/>
          Message: {message || 'aucun'}<br/>
          <em>Vérifiez la console pour plus de détails</em>
        </div>

        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          <p>Pas de compte ? <a href="/register">S'inscrire</a></p>
          <p>Mot de passe oublié ? <a href="/forgot-password">Réinitialiser</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;