// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

// ✅ On importe ton composant centralisé
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

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
