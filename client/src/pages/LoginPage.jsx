import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
//import { useAuth } from '../context/authContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  //const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      setLoading(true);
      //await login(identifier, password);
      await axios.post('http://localhost:3001/auth/login', {
        identifier,
        password: password,
      });
      navigate('/profil');
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Nom d'utilisateur, email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Connexion</h2>
        <input
          className="login-input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Nom d'utilisateur ou email"
        />
        <input
          className="login-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        <button
          type="submit"
          disabled={loading}
          className="login-submit-button"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        {error && <p className="login-error-message">{error}</p>}
        <div className="login-forgot-password">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;