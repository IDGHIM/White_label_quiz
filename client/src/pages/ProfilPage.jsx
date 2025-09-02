import React, { useState, useEffect } from 'react';
import '../styles/ProfilPage.css'; 

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const userData = await response.json();
      setUser(userData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profil-container">
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button className="btn-edit-profile" onClick={fetchUserProfile}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="profil-container">
      {/* HEADER */}
      <div className="profil-header">
        <div className="profil-avatar">
          {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="profil-info">
          <h1>{user?.username || 'Nom d’utilisateur'}</h1>
          <p className="profil-email">{user?.email || 'Non disponible'}</p>
          <p className="profil-member">
            {user?.isVerified ? 'Compte vérifié' : 'Compte non vérifié'}
          </p>
          <button className="btn-edit-profile" onClick={fetchUserProfile}>
            Actualiser les informations
          </button>
        </div>
      </div>

      {/* STATISTIQUES SIMPLES */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{user?.role || 'Utilisateur'}</div>
          <div className="stat-label">Rôle</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-value">1</div>
          <div className="stat-label">Emails enregistrés</div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="profil-content">
        <div className="category-stats">
          <h2>Informations principales</h2>
          <div className="category-grid">
            <div className="category-card">
              <h3>Email</h3>
              <p>{user?.email || "Non disponible"}</p>
            </div>
            <div className="category-card">
              <h3>Statut</h3>
              <p>{user?.isVerified ? "Vérifié" : "Non vérifié"}</p>
            </div>
          </div>
        </div>

        <div className="history-section">
          <h2>Historique</h2>
          <div className="history-list">
            <div className="history-item">
              <div className="history-info">
                <h3>Connexion</h3>
                <div className="history-meta">
                  <span className="history-date">Aujourd’hui</span>
                  <span className="history-duration">Session active</span>
                </div>
              </div>
              <div className="history-score">
                <span className="score-badge score-good">OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
