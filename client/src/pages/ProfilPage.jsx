import React, { useState, useEffect } from 'react';
import '../styles/ProfilPage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: ''
  });

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
      setEditForm({
        username: userData.data?.username || '',
        email: userData.data?.email || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = () => {
    // Ici vous pouvez ajouter la logique pour sauvegarder les modifications
    console.log('Sauvegarde des modifications:', editForm);
    setIsEditing(false);
    // Mettre à jour l'état user avec les nouvelles données
    setUser({
      ...user,
      ...editForm
    });
  };

  // Fonction pour calculer le temps depuis l'inscription
  const getAccountAge = () => {
    if (user?.createdAt) {
      const created = new Date(user.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} jours`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} mois`;
      } else {
        return `${Math.floor(diffDays / 365)} ans`;
      }
    }
    return 'Récent';
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
          <h1>{user?.username || 'Nom utilisateur'}</h1>
          <p className="profil-email">{user?.email || 'Non disponible'}</p>
          
          <p className="profil-member">
            {user?.isVerified ? 'Compte vérifié ✓' : 'Compte non vérifié'}
          </p>
          
          <div className="profile-actions">
            <button className="btn-refresh" onClick={fetchUserProfile}>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{user?.role || 'Utilisateur'}</div>
          <div className="stat-label">Rôle</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{getAccountAge()}</div>
          <div className="stat-label">Membre depuis</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-value">{user?.isVerified ? 'Sécurisé' : 'À vérifier'}</div>
          <div className="stat-label">Statut de sécurité</div>
        </div>
      </div>

        {/* Informations principales */}
        <div className="category-stats">
          <h2>Informations du compte</h2>
          <div className="category-grid">
            <div className="category-card">
              <h3>📧 Email</h3>
              <p>{user?.email || "Non disponible"}</p>
            </div>
            <div className="category-card">
              <h3>🎯 Statut</h3>
              <p>{user?.isVerified ? "Vérifié" : "Non vérifié"}</p>
            </div>
            <div className="category-card">
              <h3>🏷️ Rôle</h3>
              <p>{user?.role || "Utilisateur standard"}</p>
            </div>
            <div className="category-card">
              <h3>📊 Niveau d'activité</h3>
              <p>Actif</p>
            </div>
          </div>
        </div>

        {/* Section Activité récente */}
        <div className="activity-section">
          <h2>Activité récente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🔑</div>
              <div className="activity-info">
                <h3>Dernière connexion</h3>
                <p className="activity-time">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✏️</div>
              <div className="activity-info">
                <h3>Profil consulté</h3>
                <p className="activity-time">Aujourd'hui</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔄</div>
              <div className="activity-info">
                <h3>Données synchronisées</h3>
                <p className="activity-time">Hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfilePage;