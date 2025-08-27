import React, { useState, useEffect } from 'react';

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
      
      console.log('Tentative de connexion à l\'API...');
      
      const response = await fetch('http://localhost:3001/api/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ajoutez ici votre token d'authentification si nécessaire
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include' // Pour inclure les cookies si nécessaire
      });

      console.log('Réponse de l\'API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Erreur de l\'API:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const userData = await response.json();
      console.log('Données utilisateur reçues:', userData);
      // Les données utilisateur sont dans userData.data
      setUser(userData.data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération du profil:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button onClick={fetchUserProfile}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Mon Profil</h1>
      <p>Informations de votre compte</p>

      <div>
        <h2>{user?.username || 'Nom d\'utilisateur'}</h2>
        <p>Rôle: {user?.role || 'Utilisateur'}</p>
        
        <div>
          <label>Adresse email:</label>
          <p>{user?.email || 'Non disponible'}</p>
        </div>

        <div>
          <label>Statut du compte:</label>
          <p>{user?.isVerified ? 'Compte vérifié' : 'Compte non vérifié'}</p>
        </div>

        <button onClick={fetchUserProfile}>
          Actualiser les informations
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;