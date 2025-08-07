import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaUserPlus } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome } from "react-icons/fi";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fonction pour vérifier l'état de connexion
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const user = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (token) {
      setIsLoggedIn(true);
      if (user) {
        try {
          setUserData(JSON.parse(user));
        } catch (error) {
          console.error('Erreur lors de la lecture des données utilisateur:', error);
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // Vérifier l'état de connexion au montage et écouter les changements
  useEffect(() => {
    checkAuthStatus();

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Vérifier périodiquement l'état de connexion
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Optionnel: Appeler l'API de déconnexion
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        try {
          await fetch('http://localhost:5173/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion côté serveur:', error);
        }
      }

      // Nettoyer le stockage local
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');

      // Mettre à jour l'état
      setIsLoggedIn(false);
      setUserData(null);

      // Rediriger vers la page d'accueil
      navigate('/');
      
      // Optionnel: Afficher un message de confirmation
      alert('Déconnexion réussie !');
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Hackathon Quiz
      </Link>
      <div className="navbar-menu">
        <Link
          className="navbar-btn active"
          title="Accueil"
          aria-label="Accueil"
          to="/"
        >
          <FiHome />
          <span className="tooltip">Accueil</span>
        </Link>
        
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
        
        {isLoggedIn && (
          <>
            <Link
              className="navbar-btn active"
              title="Profil"
              aria-label="Profil"
              to="/profil"
            >
              <FaUserCircle />
              <span className="tooltip">
                {userData?.name ? `Profil de ${userData.name}` : 'Profil'}
              </span>
            </Link>
            <button
              className="navbar-btn active logout-btn"
              title="Déconnexion"
              aria-label="Déconnexion"
              onClick={handleLogout}
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