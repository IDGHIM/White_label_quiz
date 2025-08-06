import React, { useState, useEffect } from 'react';
import '../styles/AdminPage.css';

const HackathonAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // États pour les formulaires
  const [userForm, setUserForm] = useState({ _id: '', username: '', email: '', password: '', role: 'user' });
  const [questionForm, setQuestionForm] = useState({
    _id: '',
    category: '',
    question: '',
    answers: ['', '', ''],
    correctAnswers: [], // Changé pour supporter plusieurs réponses
  });

  // Fonction pour récupérer les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      // Remplacez par votre endpoint API
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      // Données de test en cas d'erreur
      setUsers([
        { _id: '1', username: 'Jean Dupont', email: 'jean@example.com', role: 'user' },
        { _id: '2', username: 'Marie Martin', email: 'marie@example.com', role: 'admin' },
        { _id: '3', username: 'Pierre Durand', email: 'pierre@example.com', role: 'user' },
      ]);
    }
  };

  // Fonction pour récupérer les questions depuis l'API
  const fetchQuestions = async () => {
    try {
      // Remplacez par votre endpoint API
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Erreur lors du chargement des questions:', err);
      // Données de test en cas d'erreur
      setQuestions([
        {
          _id: '1',
          category: 'Histoire',
          question: "En quelle année a eu lieu la chute de l'Empire romain d'Occident ?",
          answers: ['395', '410', '476'],
          correctAnswers: ['476']
        },
        {
          _id: '2',
          category: 'Sciences',
          question: "Quelle est la formule chimique de l'eau ?",
          answers: ['H2O', 'CO2', 'O2'],
          correctAnswers: ['H2O']
        }
      ]);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchQuestions()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // API - Créer ou modifier un utilisateur
  const apiSaveUser = async (userData) => {
    try {
      const method = userData._id ? 'PUT' : 'POST';
      const url = userData._id ? `/api/users/${userData._id}` : '/api/users';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', err);
      throw err;
    }
  };

  // API - Supprimer un utilisateur
  const apiDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      throw err;
    }
  };

  // API - Créer ou modifier une question
  const apiSaveQuestion = async (questionData) => {
    try {
      const method = questionData._id ? 'PUT' : 'POST';
      const url = questionData._id ? `/api/questions/${questionData._id}` : '/api/questions';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la question:', error);
      throw error;
    }
  };

  // API - Supprimer une question
  const apiDeleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      throw error;
    }
  };

  // Gestion des utilisateurs
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ _id: user._id, username: user.username, email: user.email, password: '', role: user.role });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await apiDeleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        alert('Utilisateur supprimé avec succès');
      } catch (error) {
        alert(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
      }
    }
  };

  const handleSaveUser = async () => {
    // Validation côté client
    if (!userForm.username.trim()) {
      alert('Le nom d\'utilisateur est requis');
      return;
    }

    if (!userForm.email.trim()) {
      alert('L\'email est requis');
      return;
    }

    if (!editingUser && !userForm.password.trim()) {
      alert('Le mot de passe est requis pour un nouveau utilisateur');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      alert('Veuillez entrer un email valide');
      return;
    }

    try {
      // Préparer les données à envoyer
      const dataToSend = { ...userForm };

      // Si c'est une création (pas d'_id ou _id vide), on supprime le champ _id
      if (!dataToSend._id || dataToSend._id.trim() === '') {
        delete dataToSend._id;
      }

      // Si c'est une modification et que le mot de passe est vide, on ne l'envoie pas
      if (editingUser && !dataToSend.password.trim()) {
        delete dataToSend.password;
      }

      const savedUser = await apiSaveUser(dataToSend);

      if (editingUser) {
        // Modification
        setUsers(users.map(user =>
          user._id === editingUser._id ? savedUser : user
        ));
      } else {
        // Création
        setUsers([...users, savedUser]);
      }

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ _id: '', username: '', email: '', password: '', role: 'user' });

      // Message de succès
      alert(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
    } catch (error) {
      alert(`Erreur lors de la sauvegarde de l'utilisateur: ${error.message}`);
    }
  };

  // Gestion des questions
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      _id: question._id,
      category: question.category,
      question: question.question,
      answers: [...question.answers],
      correctAnswers: question.correctAnswers ? [...question.correctAnswers] : (question.correctAnswer ? [question.correctAnswer] : [])
    });
    setShowQuestionModal(true);
  };

  const handleDuplicateQuestion = async (question) => {
    try {
      const duplicatedQuestion = {
        ...question,
        question: question.question + ' (Copie)'
      };

      // Supprimer l'_id pour créer une nouvelle question
      delete duplicatedQuestion._id;

      const savedQuestion = await apiSaveQuestion(duplicatedQuestion);
      setQuestions([...questions, savedQuestion]);
    } catch (error) {
      alert(`Erreur lors de la duplication de la question: ${error.message}`);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await apiDeleteQuestion(questionId);
        setQuestions(questions.filter(q => q._id !== questionId));
      } catch {
        alert('Erreur lors de la suppression de la question');
      }
    }
  };

  const handleSaveQuestion = async () => {
    // Validation côté client
    if (!questionForm.category.trim()) {
      alert('La catégorie est requise');
      return;
    }

    if (!questionForm.question.trim()) {
      alert('La question est requise');
      return;
    }

    // Vérifier que toutes les réponses sont remplies
    const filledAnswers = questionForm.answers.filter(answer => answer.trim() !== '');
    if (filledAnswers.length < 3) {
      alert('Toutes les options de réponse doivent être remplies');
      return;
    }

    if (questionForm.correctAnswers.length === 0) {
      alert('Au moins une bonne réponse doit être sélectionnée');
      return;
    }

    try {
      // Préparer les données à envoyer
      const dataToSend = { ...questionForm };

      // Si c'est une création (pas d'_id ou _id vide), on supprime le champ _id
      if (!dataToSend._id || dataToSend._id.trim() === '') {
        delete dataToSend._id;
      }

      const savedQuestion = await apiSaveQuestion(dataToSend);

      if (editingQuestion) {
        // Modification
        setQuestions(questions.map(q =>
          q._id === editingQuestion._id ? savedQuestion : q
        ));
      } else {
        // Création
        setQuestions([...questions, savedQuestion]);
      }

      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionForm({
        _id: '',
        category: '',
        question: '',
        answers: ['', '', ''],
        correctAnswers: []
      });

      // Message de succès
      alert(editingQuestion ? 'Question modifiée avec succès' : 'Question créée avec succès');
    } catch (error) {
      alert(`Erreur lors de la sauvegarde de la question: ${error.message}`);
    }
  };

  // Fonction pour gérer la sélection multiple des bonnes réponses
  const handleCorrectAnswerToggle = (answer) => {
    const currentCorrectAnswers = [...questionForm.correctAnswers];
    const answerIndex = currentCorrectAnswers.indexOf(answer);

    if (answerIndex > -1) {
      // Retirer la réponse si elle est déjà sélectionnée
      currentCorrectAnswers.splice(answerIndex, 1);
    } else {
      // Ajouter la réponse si elle n'est pas sélectionnée
      currentCorrectAnswers.push(answer);
    }

    setQuestionForm({ ...questionForm, correctAnswers: currentCorrectAnswers });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="main-content">
        {/* Sidebar - Gestion utilisateur */}
        <div className="sidebar">
          <div className="user-management">
            <div className="section-header">
              <h2>Gestion utilisateur</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ _id: '', username: '', email: '', password: '', role: 'user' });
                  setShowUserModal(true);
                }}
                className="btn-add"
              >
                Ajouter
              </button>
            </div>

            <div className="user-list">
              {users.map(user => (
                <div key={user._id} className="user-item">
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role">Rôle: {user.role}</div>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="btn-edit"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="btn-delete"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content - Gestion des questions */}
        <div className="content">
          <div className="question-management">
            <div className="section-header">
              <h2>Gestion des questions</h2>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setQuestionForm({
                    _id: '',
                    category: '',
                    question: '',
                    answers: ['', '', ''],
                    correctAnswers: []
                  });
                  setShowQuestionModal(true);
                }}
                className="btn-add"
              >
                Ajouter une question
              </button>
            </div>

            <div className="question-list">
              {questions.map(question => (
                <div key={question._id} className="question-item">
                  <div className="question-content">
                    <div className="question-category">
                      Catégorie : {question.category}
                    </div>
                    <div className="question-text">
                      Question : {question.question}
                    </div>
                    <ul className="question-options">
                      {question.answers.map((answer, index) => (
                        <li key={index}>{String.fromCharCode(65 + index)}) {answer}</li>
                      ))}
                    </ul>
                    <div className="correct-answer">
                      Bonne(s) réponse(s) : {question.correctAnswers ? question.correctAnswers.join(', ') : (question.correctAnswer || 'Non définie')}
                    </div>
                  </div>
                  <div className="question-actions">
                    <button
                      onClick={() => handleDuplicateQuestion(question)}
                      className="btn-duplicate"
                      title="Dupliquer"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="btn-edit"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="btn-delete"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Utilisateur */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h3>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : ''}</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="form-input"
                required={!editingUser}
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="form-select"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveUser} className="btn-save">
                Sauvegarder
              </button>
              <button onClick={() => setShowUserModal(false)} className="btn-cancel">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Question */}
      {showQuestionModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h3 className="modal-title">
              {editingQuestion ? 'Modifier la question' : 'Ajouter une question'}
            </h3>
            <div className="form-group">
              <label>Catégorie</label>
              <input
                type="text"
                value={questionForm.category}
                onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Question</label>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <label>Option A</label>
              <input
                type="text"
                value={questionForm.answers[0] || ''}
                onChange={(e) => {
                  const newAnswers = [...questionForm.answers];
                  newAnswers[0] = e.target.value;
                  setQuestionForm({ ...questionForm, answers: newAnswers });
                }}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Option B</label>
              <input
                type="text"
                value={questionForm.answers[1] || ''}
                onChange={(e) => {
                  const newAnswers = [...questionForm.answers];
                  newAnswers[1] = e.target.value;
                  setQuestionForm({ ...questionForm, answers: newAnswers });
                }}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Option C</label>
              <input
                type="text"
                value={questionForm.answers[2] || ''}
                onChange={(e) => {
                  const newAnswers = [...questionForm.answers];
                  newAnswers[2] = e.target.value;
                  setQuestionForm({ ...questionForm, answers: newAnswers });
                }}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Bonne(s) réponse(s) (cochez une ou plusieurs réponses)</label>
              <div className="checkbox-group">
                {questionForm.answers.map((answer, index) => (
                  answer && (
                    <div key={index} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`answer-${index}`}
                        checked={questionForm.correctAnswers.includes(answer)}
                        onChange={() => handleCorrectAnswerToggle(answer)}
                        className="form-checkbox"
                      />
                      <label htmlFor={`answer-${index}`} className="checkbox-label">
                        {String.fromCharCode(65 + index)}: {answer}
                      </label>
                    </div>
                  )
                ))}
              </div>
              {questionForm.correctAnswers.length > 0 && (
                <div className="selected-answers">
                  Réponse(s) sélectionnée(s) : {questionForm.correctAnswers.join(', ')}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveQuestion} className="btn-save">
                Sauvegarder
              </button>
              <button onClick={() => setShowQuestionModal(false)} className="btn-cancel">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonAdminPanel;