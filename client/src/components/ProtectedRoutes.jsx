import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/profil', {
          credentials: 'include' // Important pour les cookies
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data); // Selon ton authController
        }
      } catch (error) {
        console.error('Erreur auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading-container">Vérification des permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <p>Rôle requis : {requiredRole}</p>
        <p>Votre rôle : {user.role}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;