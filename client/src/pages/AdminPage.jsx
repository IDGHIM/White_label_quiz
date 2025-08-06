import React, { useState, useEffect } from "react";
import "../styles/AdminPage.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCopy,
  FaQuestionCircle,
  FaUsers,
} from "react-icons/fa";

const AdminPage = () => {
  // États pour les données
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // États pour les formulaires
  const [userForm, setUserForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "user",
  });

  const [quizForm, setQuizForm] = useState({
    id: "",
    title: "",
    category: "",
    description: "",
    questions: [],
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    correctAnswer: "A",
  });

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulation de chargement - À remplacer par vos appels API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Données de test pour les utilisateurs
        setUsers([
          {
            id: 1,
            name: "Jean Dupont",
            email: "jean@example.com",
            role: "user",
          },
          {
            id: 2,
            name: "Marie Martin",
            email: "marie@example.com",
            role: "admin",
          },
          {
            id: 3,
            name: "Pierre Durand",
            email: "pierre@example.com",
            role: "user",
          },
        ]);

        // Données de test pour les quiz
        setQuizzes([
          {
            id: 1,
            title: "Quiz Histoire de France",
            category: "Histoire",
            description: "Testez vos connaissances sur l'histoire de France",
            questions: [
              {
                id: 1,
                question: "En quelle année a eu lieu la Révolution française ?",
                optionA: "1789",
                optionB: "1792",
                optionC: "1799",
                correctAnswer: "A",
              },
              {
                id: 2,
                question: "Qui était le roi de France pendant la Révolution ?",
                optionA: "Louis XIV",
                optionB: "Louis XV",
                optionC: "Louis XVI",
                correctAnswer: "C",
              },
            ],
            createdAt: "2025-01-20",
            createdBy: "Admin",
          },
          {
            id: 2,
            title: "Quiz Sciences",
            category: "Sciences",
            description: "Questions sur les sciences naturelles",
            questions: [
              {
                id: 1,
                question: "Quelle est la formule chimique de l'eau ?",
                optionA: "H2O",
                optionB: "CO2",
                optionC: "O2",
                correctAnswer: "A",
              },
            ],
            createdAt: "2025-01-22",
            createdBy: "Admin",
          },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // === GESTION DES UTILISATEURS ===
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? { ...userForm, id: user.id } : user
          )
        );
      } else {
        const newUser = {
          ...userForm,
          id: Date.now(),
        };
        setUsers([...users, newUser]);
      }

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ id: "", name: "", email: "", role: "user" });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  // === GESTION DES QUIZ ===
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      id: "",
      title: "",
      category: "",
      description: "",
      questions: [],
    });
    setQuestionForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswer: "A",
    });
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      description: quiz.description,
      questions: quiz.questions || [],
    });
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
      try {
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleDuplicateQuiz = async (quiz) => {
    try {
      const duplicatedQuiz = {
        ...quiz,
        id: Date.now(),
        title: quiz.title + " (Copie)",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setQuizzes([...quizzes, duplicatedQuiz]);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    }
  };

  const handleAddQuestion = () => {
    if (
      questionForm.question &&
      questionForm.optionA &&
      questionForm.optionB &&
      questionForm.optionC
    ) {
      const newQuestion = {
        ...questionForm,
        id: Date.now(),
      };
      setQuizForm({
        ...quizForm,
        questions: [...quizForm.questions, newQuestion],
      });
      setQuestionForm({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        correctAnswer: "A",
      });
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((q) => q.id !== questionId),
    });
  };

  const handleSaveQuiz = async () => {
    try {
      if (editingQuiz) {
        setQuizzes(
          quizzes.map((q) =>
            q.id === editingQuiz.id
              ? {
                  ...quizForm,
                  createdAt: editingQuiz.createdAt,
                  createdBy: editingQuiz.createdBy,
                }
              : q
          )
        );
      } else {
        const newQuiz = {
          ...quizForm,
          id: Date.now(),
          createdAt: new Date().toISOString().split("T")[0],
          createdBy: "Admin",
        };
        setQuizzes([...quizzes, newQuiz]);
      }
      setShowQuizModal(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panneau d'Administration</h1>
        <div className="admin-stats">
          <div className="stat-badge">
            <FaUsers /> {users.length} utilisateurs
          </div>
          <div className="stat-badge">
            <FaQuestionCircle /> {quizzes.length} quiz
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
          onClick={() => setActiveTab("quizzes")}
        >
          <FaQuestionCircle /> Gestion des Quiz
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers /> Gestion des Utilisateurs
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {/* Onglet Quiz */}
        {activeTab === "quizzes" && (
          <div className="quiz-management">
            <div className="section-header">
              <h2>Tous les Quiz</h2>
              <button onClick={handleCreateQuiz} className="btn-primary">
                <FaPlus /> Créer un quiz
              </button>
            </div>

            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-card-header">
                    <span className="quiz-category">{quiz.category}</span>
                    <span className="quiz-questions-count">
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  <h3>{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                  <div className="quiz-meta">
                    <span>Créé le {quiz.createdAt}</span>
                    <span>Par {quiz.createdBy}</span>
                  </div>
                  <div className="quiz-actions">
                    <button
                      onClick={() => handleDuplicateQuiz(quiz)}
                      className="btn-icon"
                      title="Dupliquer"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="btn-icon"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="btn-icon btn-danger"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === "users" && (
          <div className="user-management">
            <div className="section-header">
              <h2>Tous les Utilisateurs</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ id: "", name: "", email: "", role: "user" });
                  setShowUserModal(true);
                }}
                className="btn-primary"
              >
                <FaPlus /> Ajouter un utilisateur
              </button>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === "admin"
                            ? "Administrateur"
                            : "Utilisateur"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn-icon"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn-icon btn-danger"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Utilisateur */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {editingUser
                ? "Modifier l'utilisateur"
                : "Ajouter un utilisateur"}
            </h2>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
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
              <button
                onClick={() => setShowUserModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quiz */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingQuiz ? "Modifier le quiz" : "Créer un quiz"}</h2>

            <div className="form-group">
              <label>Titre du quiz</label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, title: e.target.value })
                }
                className="form-input"
                placeholder="Ex: Quiz Histoire de France"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={quizForm.description}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, description: e.target.value })
                }
                className="form-textarea"
                placeholder="Décrivez le quiz..."
              />
            </div>

            <div className="form-group">
              <label>Catégorie</label>
              <select
                value={quizForm.category}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, category: e.target.value })
                }
                className="form-select"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Histoire">Histoire</option>
                <option value="Sciences">Sciences</option>
                <option value="Culture">Culture Générale</option>
                <option value="Sport">Sport</option>
                <option value="Géographie">Géographie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Section Questions */}
            <div className="questions-section">
              <h3>Questions ({quizForm.questions.length})</h3>

              {quizForm.questions.length > 0 && (
                <div className="questions-list">
                  {quizForm.questions.map((q, index) => (
                    <div key={q.id} className="question-preview">
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </div>
                      <div className="question-content">
                        <p className="question-text">{q.question}</p>
                        <div className="options-preview">
                          <span
                            className={q.correctAnswer === "A" ? "correct" : ""}
                          >
                            A) {q.optionA}
                          </span>
                          <span
                            className={q.correctAnswer === "B" ? "correct" : ""}
                          >
                            B) {q.optionB}
                          </span>
                          <span
                            className={q.correctAnswer === "C" ? "correct" : ""}
                          >
                            C) {q.optionC}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire d'ajout de question */}
              <div className="add-question-form">
                <h4>Ajouter une question</h4>
                <div className="form-group">
                  <input
                    type="text"
                    value={questionForm.question}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        question: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="Entrez votre question..."
                  />
                </div>

                <div className="options-grid">
                  <div className="form-group">
                    <label>Option A</label>
                    <input
                      type="text"
                      value={questionForm.optionA}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          optionA: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Option B</label>
                    <input
                      type="text"
                      value={questionForm.optionB}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          optionB: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Option C</label>
                    <input
                      type="text"
                      value={questionForm.optionC}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          optionC: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bonne réponse</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="form-select"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="btn-add-question"
                >
                  + Ajouter cette question
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSaveQuiz}
                className="btn-save"
                disabled={
                  !quizForm.title ||
                  !quizForm.category ||
                  quizForm.questions.length === 0
                }
              >
                {editingQuiz ? "Mettre à jour" : "Créer le quiz"}
              </button>
              <button
                onClick={() => setShowQuizModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
