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
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '' });
  const [questionForm, setQuestionForm] = useState({
    id: '',
    category: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    correctAnswer: 'A,B,C', 
  });

  // Fonction pour récupérer les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      // Remplacez par votre endpoint API
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      // Données de test en cas d'erreur
      setUsers([
        { id: 1, name: 'Jean Dupont', email: 'jean@example.com' },
        { id: 2, name: 'Marie Martin', email: 'marie@example.com' },
        { id: 3, name: 'Pierre Durand', email: 'pierre@example.com' },
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
          id: 1,
          category: 'Histoire',
          question: "En quelle année a eu lieu la chute de l'Empire romain d'Occident ?",
          optionA: '395',
          optionB: '410',
          optionC: '476',
          correctAnswer: 'C'
        },
        {
          id: 2,
          category: 'Sciences',
          question: "Quelle est la formule chimique de l'eau ?",
          optionA: 'H2O',
          optionB: 'CO2',
          optionC: 'O2',
          correctAnswer: 'A'
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
      const method = userData.id ? 'PUT' : 'POST';
      const url = userData.id ? `/api/users/${userData.id}` : '/api/users';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      return await response.json();
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
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      throw err;
    }
  };

  // API - Créer ou modifier une question
  const apiSaveQuestion = async (questionData) => {
    try {
      const method = questionData.id ? 'PUT' : 'POST';
      const url = questionData.id ? `/api/questions/${questionData.id}` : '/api/questions';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
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
    setUserForm({ id: user.id, name: user.name, email: user.email });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await apiDeleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch {
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      const savedUser = await apiSaveUser(userForm);
      
      if (editingUser) {
        // Modification
        setUsers(users.map(user => 
          user.id === editingUser.id ? savedUser : user
        ));
      } else {
        // Création
        setUsers([...users, savedUser]);
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ id: '', name: '', email: '' });
    } catch {
      alert('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  // Gestion des questions
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      id: question.id,
      category: question.category,
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      correctAnswer: question.correctAnswer
    });
    setShowQuestionModal(true);
  };

  const handleDuplicateQuestion = async (question) => {
    try {
      const duplicatedQuestion = {
        ...question,
        id: null, // Nouveau ID sera généré par l'API
        question: question.question + ' (Copie)'
      };
      
      const savedQuestion = await apiSaveQuestion(duplicatedQuestion);
      setQuestions([...questions, savedQuestion]);
    } catch {
      alert('Erreur lors de la duplication de la question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await apiDeleteQuestion(questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
      } catch {
        alert('Erreur lors de la suppression de la question');
      }
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const savedQuestion = await apiSaveQuestion(questionForm);
      
      if (editingQuestion) {
        // Modification
        setQuestions(questions.map(q => 
          q.id === editingQuestion.id ? savedQuestion : q
        ));
      } else {
        // Création
        setQuestions([...questions, savedQuestion]);
      }
      
      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionForm({
        id: '',
        category: '',
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        correctAnswer: 'A'
      });
    } catch {
      alert('Erreur lors de la sauvegarde de la question');
    }
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
                  setUserForm({ id: '', name: '', email: '' });
                  setShowUserModal(true);
                }}
                className="btn-add"
              >
                Ajouter
              </button>
            </div>
            
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
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
                      onClick={() => handleDeleteUser(user.id)}
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
                    id: '',
                    category: '',
                    question: '',
                    optionA: '',
                    optionB: '',
                    optionC: '',
                    correctAnswer: 'A'
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
                <div key={question.id} className="question-item">
                  <div className="question-content">
                    <div className="question-category">
                      Catégorie : {question.category}
                    </div>
                    <div className="question-text">
                      Question : {question.question}
                    </div>
                    <ul className="question-options">
                      <li>A) {question.optionA}</li>
                      <li>B) {question.optionB}</li>
                      <li>C) {question.optionC}</li>
                    </ul>
                    <div className="correct-answer">
                      Bonne réponse : {question.correctAnswer}) {question[`option${question.correctAnswer}`]}
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
                      onClick={() => handleDeleteQuestion(question.id)}
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
              <label>Nom</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="form-input"
              />
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
                onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Question</label>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <label>Option A</label>
              <input
                type="text"
                value={questionForm.optionA}
                onChange={(e) => setQuestionForm({...questionForm, optionA: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Option B</label>
              <input
                type="text"
                value={questionForm.optionB}
                onChange={(e) => setQuestionForm({...questionForm, optionB: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Option C</label>
              <input
                type="text"
                value={questionForm.optionC}
                onChange={(e) => setQuestionForm({...questionForm, optionC: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Bonne réponse</label>
              <select
                value={questionForm.correctAnswer}
                onChange={(e) => setQuestionForm({...questionForm, correctAnswer: e.target.value})}
                className="form-select"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
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