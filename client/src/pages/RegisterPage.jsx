import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/auth/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });
      setMessage("Compte créé ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Erreur register:', error.response?.data || error.message);
      setMessage(`Erreur lors de la création du compte : ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Créer un compte</h2>
        <input
          className="register-input"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
          required
        />
        <input
          className="register-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Adresse email"
          required
        />
        <input
          className="register-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
        />
        <button type="submit" className="register-submit-button">S'inscrire</button>
        {message && <p className="register-message">{message}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;