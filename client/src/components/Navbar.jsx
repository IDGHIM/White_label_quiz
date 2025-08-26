import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaUserPlus } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome } from "react-icons/fi";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction pour vérifier l'état de connexion via l'API
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include', // Important pour envoyer les cookies
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
        // Token invalide ou expiré
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

  // Vérifier l'état de connexion au montage
  useEffect(() => {
    checkAuthStatus();

    // Vérifier périodiquement l'état de connexion (optionnel)
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Toutes les 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Important pour envoyer les cookies
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
      // Mettre à jour l'état local même si l'API échoue
      setIsLoggedIn(false);
      setUserData(null);
      navigate('/');
    }
  };

  // Fonction pour forcer la mise à jour après connexion/inscription
  const refreshAuthStatus = () => {
    checkAuthStatus();
  };

  // Exposer la fonction globalement pour l'utiliser après connexion
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
          <span>Chargement...</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
         Quiz
      </Link>
      <div className="navbar-menu">
        {/* Bouton Accueil - toujours visible */}
        <Link
          className="navbar-btn active"
          title="Accueil"
          aria-label="Accueil"
          to="/"
        >
          <FiHome />
          <span className="tooltip">Accueil</span>
        </Link>
        
        {/* Boutons pour utilisateurs non connectés */}
        {!isLoggedIn && (
          <>
            <Link
              className="navbar-btn active"
              title="Inscription"
              aria-label="Inscription"
              to="/register"
            >
              <FaUserPlus />
              <span className="tooltip">Inscription</span>
            </Link>
            <Link
              className="navbar-btn active"
              title="Connexion"
              aria-label="Connexion"
              to="/login"
            >
              <FiLogIn />
              <span className="tooltip">Connexion</span>
            </Link>
          </>
        )}
        
        {/* Boutons pour utilisateurs connectés */}
        {isLoggedIn && userData && (
          <>
            <Link
              className="navbar-btn active"
              title="Profil"
              aria-label="Profil"
              to="/profil"
            >
              <FaUserCircle />
              <span className="tooltip">
                {userData.username ? 
                  `Profil de ${userData.username}` : 
                  'Mon Profil'
                }
              </span>
            </Link>
            <button
              className="navbar-btn active logout-btn"
              title="Déconnexion"
              aria-label="Déconnexion"
              onClick={handleLogout}
              type="button"
            >
              <FiLogOut />
              <span className="tooltip">Déconnexion</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;