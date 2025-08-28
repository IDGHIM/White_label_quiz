import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import QuizPage from "./pages/QuizPage";
import ContactPage from "./pages/ContactPage";
import ProfilPage from "./pages/ProfilPage";
import LegalNoticePage from "./pages/LegalNoticePage";
import LicencePage from "./pages/LicencePage";
import AccessibilityMenu from "./components/AccessiblityMenu";
import EmailVerificationPage from "./pages/EmailVerificationPage";

// Composant de protection des routes
const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Vérification des permissions...');
        
        const response = await fetch('http://localhost:3001/api/profil', {
          method: 'GET',
          credentials: 'include', // Important pour envoyer les cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Réponse auth:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Utilisateur authentifié:', data);
          
          // Adapter selon la structure de réponse de ton authController
          const userData = data.data || data.user || data;
          setUser(userData);
        } else if (response.status === 401) {
          console.log('❌ Non authentifié');
          setUser(null);
        } else {
          console.log('⚠️ Erreur serveur:', response.status);
          setError('Erreur de vérification des permissions');
        }
      } catch (error) {
        console.error('💥 Erreur réseau:', error);
        setError('Impossible de vérifier les permissions');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  // Erreur de connexion
  if (error) {
    return (
      <div className="auth-error">
        <h2>Erreur de connexion</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  // Non authentifié - redirection vers login
  if (!user) {
    console.log('🔄 Redirection vers login - utilisateur non authentifié');
    return <Navigate to="/login" replace />;
  }

  // Vérification du rôle spécifique
  if (requiredRole && user.role !== requiredRole) {
    console.log(`🚫 Accès refusé - Rôle requis: ${requiredRole}, Rôle utilisateur: ${user.role}`);
    
    return (
      <div className="access-denied-page">
        <div className="access-denied-container">
          <div className="access-denied-icon">🚫</div>
          <h1>Accès refusé</h1>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <div className="access-denied-actions">
            <button onClick={() => window.history.back()}>
              ← Retour
            </button>
            <button onClick={() => window.location.href = '/'}>
              🏠 Accueil
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .access-denied-page {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .access-denied-container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
          }
          .access-denied-icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }
          .access-denied-container h1 {
            color: #dc3545;
            margin-bottom: 15px;
          }
          .access-denied-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: left;
          }
          .access-denied-details p {
            margin: 5px 0;
            font-family: monospace;
          }
          .access-denied-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
          }
          .access-denied-actions button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 16px;
          }
          .access-denied-actions button:hover {
            background: #0056b3;
          }
          .auth-loading, .auth-error {
            min-height: 50vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .auth-error {
            background: #fff3cd;
            border-radius: 5px;
            margin: 20px;
          }
          .auth-error h2 {
            color: #856404;
            margin-bottom: 10px;
          }
          .auth-error button {
            margin-top: 15px;
            padding: 8px 16px;
            background: #ffc107;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Utilisateur autorisé
  console.log('✅ Accès accordé pour:', user.username, 'Role:', user.role);
  return children;
};

const App = () => {
  console.log('🚀 App.jsx chargé');

  return (
    <Router>
      <Navbar />
      <AccessibilityMenu />
      <Routes>
        {/* =================== ROUTES PUBLIQUES =================== */}
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/legal-notice" element={<LegalNoticePage />} />
        <Route path="/licence" element={<LicencePage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Routes d'authentification */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/auth/verify/:token" element={<EmailVerificationPage />} />

        {/* =================== ROUTES PROTÉGÉES =================== */}
        
        {/* Route Admin - Accessible uniquement aux admins */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Route Profil - Accessible aux utilisateurs connectés */}
        <Route 
          path="/profil" 
          element={
            <ProtectedRoute>
              <ProfilPage />
            </ProtectedRoute>
          } 
        />

        {/* =================== ROUTE 404 =================== */}
        <Route 
          path="*" 
          element={
            <div style={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <h1 style={{ fontSize: '4rem', margin: '0', color: '#dc3545' }}>404</h1>
              <h2 style={{ margin: '10px 0', color: '#6c757d' }}>Page non trouvée</h2>
              <p style={{ marginBottom: '30px', color: '#6c757d' }}>
                La page que vous recherchez n'existe pas.
              </p>
              <button 
                onClick={() => window.history.back()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                ← Retour
              </button>
              <a 
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              >
                🏠 Accueil
              </a>
            </div>
          } 
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;