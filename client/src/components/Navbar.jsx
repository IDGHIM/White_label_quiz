import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaUserPlus, FaCrown, FaGamepad } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome, FiUser } from "react-icons/fi";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction pour vérifier l'état de connexion via l'API
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setIsLoggedIn(true);
          setUserData(data.data);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Déconnexion réussie');
      } else {
        console.error('Erreur lors de la déconnexion côté serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggedIn(false);
      setUserData(null);
      navigate('/');
    }
  };

  const refreshAuthStatus = () => {
    checkAuthStatus();
  };

  useEffect(() => {
    window.refreshNavbarAuth = refreshAuthStatus;
    return () => {
      delete window.refreshNavbarAuth;
    };
  }, []);

  if (loading) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          Quiz
        </Link>
        <div className="navbar-menu">
          <div className="loading-indicator">
            <span>Chargement...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${isLoggedIn ? 'navbar-authenticated' : 'navbar-guest'}`}>
      <Link to="/" className="navbar-logo">
        {/* Logo différent selon l'état de connexion */}
        {isLoggedIn ? '🎯 Quiz Pro' : '📝 Quiz'}
      </Link>
      
      <div className="navbar-menu">
        {/* Bouton Accueil - toujours visible avec icône adaptée */}
        <Link
          className={`navbar-btn ${isLoggedIn ? 'btn-authenticated' : 'btn-guest'}`}
          title="Accueil"
          aria-label="Accueil"
          to="/"
        >
          <FiHome />
          <span className="tooltip">Accueil</span>
        </Link>
        
        {/* Interface pour utilisateurs non connectés */}
        {!isLoggedIn && (
          <div className="guest-menu">
            <Link
              className="navbar-btn btn-register"
              title="Créer un compte"
              aria-label="Inscription"
              to="/register"
            >
              <FaUserPlus />
              <span className="tooltip">Inscription</span>
            </Link>
            <Link
              className="navbar-btn btn-login"
              title="Se connecter"
              aria-label="Connexion"
              to="/login"
            >
              <FiLogIn />
              <span className="tooltip">Connexion</span>
            </Link>
          </div>
        )}
        
        {/* Interface pour utilisateurs connectés */}
        {isLoggedIn && userData && (
          <div className="authenticated-menu">
            {/* Bouton Quiz - uniquement pour les connectés */}
            <Link
              className="navbar-btn btn-quiz"
              title="Mes Quiz"
              aria-label="Mes Quiz"
              to="/quiz"
            >
              <FaGamepad />
              <span className="tooltip">Mes Quiz</span>
            </Link>

            {/* Bouton Profil avec avatar personnalisé */}
            <Link
              className="navbar-btn btn-profile"
              title={`Profil de ${userData.username || 'Utilisateur'}`}
              aria-label="Profil"
              to="/profil"
            >
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt="Avatar" 
                  className="user-avatar"
                />
              ) : userData.isVIP ? (
                <FaCrown className="vip-icon" />
              ) : (
                <FaUserCircle />
              )}
              <span className="tooltip">
                {userData.username ? 
                  `Profil de ${userData.username}` : 
                  'Mon Profil'
                }
                {userData.isVIP && ' 👑'}
              </span>
            </Link>

            {/* Indicateur de score/niveau (optionnel) */}
            {userData.score && (
              <div className="score-indicator">
                <span className="score-badge">
                  {userData.score}
                </span>
              </div>
            )}

            {/* Bouton de déconnexion */}
            <button
              className="navbar-btn btn-logout"
              title="Se déconnecter"
              aria-label="Déconnexion"
              onClick={handleLogout}
              type="button"
            >
              <FiLogOut />
              <span className="tooltip">Déconnexion</span>
            </button>
          </div>
        )}

        {/* Indicateur d'état de connexion visuel */}
        <div className={`connection-status ${isLoggedIn ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;