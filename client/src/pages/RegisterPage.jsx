import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useAuth } from '../context/authContext'; 

const RegisterPage = () => {
  //const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //await register(username, email, password);
      setMessage("Compte créé ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Erreur register:', error.response?.data || error.message);
      setMessage(`Erreur lors de la création du compte : ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Nom d'utilisateur"
        required
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Adresse email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      <button type="submit" className="start-button">S'inscrire</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default RegisterPage;
