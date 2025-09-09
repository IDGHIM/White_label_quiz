// ProtectedRoutes.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/profil', {
          credentials: 'include',
        });

        if (response.ok) {
          const res = await response.json();
          console.log("📡 Réponse API:", res);

          if (res && res.data && res.data.user) {
            // ✅ on enregistre seulement l'utilisateur
            setUser(res.data.user);
          } else {
            throw new Error("Structure de réponse inattendue");
          }
        } else if (response.status === 401) {
          console.warn("❌ Non authentifié");
          setUser(null);
        } else {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
      } catch (err) {
        console.error("💥 Erreur réseau/auth:", err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log("👤 Utilisateur chargé dans ProtectedRoute:", user);

  if (requiredRole && user.role !== requiredRole) {
    console.warn(`🚫 Accès refusé : rôle requis = ${requiredRole}, rôle utilisateur = ${user.role}`);
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <p>🔑 Rôle requis : <b>{requiredRole}</b></p>
        <p>👤 Votre rôle : <b>{user.role || "non défini"}</b></p>
      </div>
    );
  }

  console.log(`✅ Accès accordé : ${user.username} (${user.role})`);
  return children;
};

export default ProtectedRoute;
