import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ForgotPasswordPage.css'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/password-reset-request', { email });
      setMessage("Un lien de réinitialisation vous a été envoyé.");
      setEmail('');
    } catch {
      setError("Une erreur est survenue. Vérifiez l'adresse email.");
    }
  };

  return (
    <div className="forgot-password-container">
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <h2>Mot de passe oublié</h2>
      <input
        type="email"
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Envoyer le lien</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
    </div>
  );
};

export default ForgotPasswordPage;