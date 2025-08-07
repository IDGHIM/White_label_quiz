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
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Utilisateur connecté
  const [activeTab, setActiveTab] = useState("quizzes");
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showExistingQuestionsModal, setShowExistingQuestionsModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // États pour les formulaires
  const [userForm, setUserForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  const [quizForm, setQuizForm] = useState({
    id: "",
    title: "",
    category: "",
    description: "",
    questions: [],
    isNewQuiz: false,
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    correctAnswers: [],
    category: "",
  });

  // États pour la sélection de questions existantes
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState([]);
  const [existingQuestionsFilter, setExistingQuestionsFilter] = useState({
    category: "",
    searchText: "",
  });

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simuler la récupération de l'utilisateur connecté
        // En attendant l'implémentation complète de l'authentification
        const mockCurrentUser = {
          id: "current_user_id",
          name: "Utilisateur Connecté", // Vous pouvez changer ceci
          email: "user@example.com",
          role: "admin"
        };
        setCurrentUser(mockCurrentUser);

        // Appel API pour récupérer les utilisateurs
        const usersResponse = await fetch('http://localhost:3000/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Adapter les données pour correspondre au format attendu par l'interface
          const adaptedUsers = usersData.map(user => ({
            id: user._id,
            name: user.username,
            email: user.email,
            role: user.role
          }));
          setUsers(adaptedUsers);
        }

        // Appel API pour récupérer les quiz depuis la base de données
        const quizzesResponse = await fetch('http://localhost:3000/api/quizzes');
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setQuizzes(quizzesData);
        }

        // Appel API pour récupérer toutes les questions pour la sélection
        const questionsResponse = await fetch('http://localhost:3000/api/questions');
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          const adaptedAllQuestions = questionsData.map(question => ({
            id: question._id,
            question: question.question,
            optionA: question.answers[0] || "",
            optionB: question.answers[1] || "",
            optionC: question.answers[2] || "",
            correctAnswers: question.correctAnswers || [],
            category: question.category,
            quizId: question.quizId
          }));
          setAllQuestions(adaptedAllQuestions);
        }
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
      password: "",
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(users.filter((user) => user.id !== userId));
        } else {
          console.error("Erreur lors de la suppression:", await response.text());
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleSaveUser = async () => {
    // Validation côté client
    if (!userForm.name.trim()) {
      alert("Le nom d'utilisateur est requis");
      return;
    }

    if (!userForm.email.trim()) {
      alert("L'email est requis");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      alert("Veuillez entrer un email valide");
      return;
    }

    try {
      if (editingUser) {
        // Mise à jour d'un utilisateur existant
        const updateData = {
          username: userForm.name,
          email: userForm.email,
          role: userForm.role
        };

        const response = await fetch(`http://localhost:3000/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUsers(
            users.map((user) =>
              user.id === editingUser.id
                ? {
                  id: updatedUser._id,
                  name: updatedUser.username,
                  email: updatedUser.email,
                  role: updatedUser.role
                }
                : user
            )
          );
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error}`);
          return;
        }
      } else {
        // Création d'un nouvel utilisateur
        if (!userForm.password || !userForm.password.trim()) {
          alert("Le mot de passe est requis pour un nouveau utilisateur");
          return;
        }

        const newUserData = {
          username: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role
        };

        const response = await fetch('http://localhost:3000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        });

        if (response.ok) {
          const createdUser = await response.json();
          const newUser = {
            id: createdUser._id,
            name: createdUser.username,
            email: createdUser.email,
            role: createdUser.role
          };
          setUsers([...users, newUser]);
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error}`);
          return;
        }
      }

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ id: "", name: "", email: "", role: "user", password: "" });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  // === GESTION DES QUIZ ===
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setEditingQuestion(null);
    setQuizForm({
      id: null,
      title: "",
      category: "",
      description: "",
      questions: [],
      isNewQuiz: true,
    });
    setQuestionForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswers: [],
      category: "",
    });
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setEditingQuestion(null);
    setQuizForm({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      description: quiz.description,
      questions: quiz.questions || [],
      isNewQuiz: false,
    });
    setQuestionForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswers: [],
      category: "",
    });
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ? Toutes les questions de ce quiz seront supprimées.")) {
      try {
        // Appeler l'API pour supprimer le quiz (qui supprimera aussi ses questions)
        const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Recharger les données depuis le serveur
          await reloadData();
        } else {
          console.error("Erreur lors de la suppression:", await response.text());
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleDuplicateQuiz = async (quiz) => {
    try {
      // Appeler l'API pour dupliquer le quiz
      const response = await fetch(`http://localhost:3000/api/quizzes/${quiz.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const duplicatedQuiz = await response.json();

        // Ajouter le nouveau quiz à la liste locale
        setQuizzes([...quizzes, duplicatedQuiz]);

        // Recharger les données pour s'assurer que tout est synchronisé
        await reloadData();
      } else {
        console.error("Erreur lors de la duplication:", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    }
  };

  const handleAddQuestion = async () => {
    if (
      questionForm.question &&
      questionForm.optionA &&
      questionForm.optionB &&
      questionForm.optionC &&
      questionForm.category &&
      questionForm.correctAnswers.length > 0
    ) {
      if (quizForm.isNewQuiz) {
        // Pour un nouveau quiz, ajouter la question localement en attendant la sauvegarde
        const tempQuestion = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID temporaire
          question: questionForm.question,
          optionA: questionForm.optionA,
          optionB: questionForm.optionB,
          optionC: questionForm.optionC,
          correctAnswers: questionForm.correctAnswers,
          category: questionForm.category,
          isTemporary: true
        };

        setQuizForm({
          ...quizForm,
          questions: [...quizForm.questions, tempQuestion],
        });

        setQuestionForm({
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          correctAnswers: [],
          category: "",
        });
      } else {
        // Pour un quiz existant, sauvegarder directement en base
        try {
          const questionData = {
            question: questionForm.question,
            answers: [questionForm.optionA, questionForm.optionB, questionForm.optionC],
            correctAnswers: questionForm.correctAnswers,
            category: questionForm.category,
            quizId: quizForm.id
          };

          const response = await fetch('http://localhost:3000/api/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
          });

          if (response.ok) {
            const createdQuestion = await response.json();

            // Ajouter la question au formulaire du quiz local
            const newQuestion = {
              id: createdQuestion._id,
              question: createdQuestion.question,
              optionA: createdQuestion.answers[0],
              optionB: createdQuestion.answers[1],
              optionC: createdQuestion.answers[2],
              correctAnswers: createdQuestion.correctAnswers || [],
              category: createdQuestion.category
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
              correctAnswers: [],
              category: "",
            });
          } else {
            const errorData = await response.json();
            alert(`Erreur lors de l'ajout de la question: ${errorData.error}`);
          }
        } catch (error) {
          console.error("Erreur lors de l'ajout de la question:", error);
          alert("Erreur de connexion au serveur");
        }
      }
    } else {
      alert("Veuillez remplir tous les champs, sélectionner une catégorie pour la question et au moins une bonne réponse");
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    const questionToRemove = quizForm.questions.find(q => q.id === questionId);

    if (questionToRemove && questionToRemove.isTemporary) {
      // Si c'est une question temporaire, la supprimer seulement localement
      setQuizForm({
        ...quizForm,
        questions: quizForm.questions.filter((q) => q.id !== questionId),
      });
    } else {
      // Si c'est une question sauvegardée, la supprimer du serveur
      try {
        const response = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Retirer la question du formulaire local
          setQuizForm({
            ...quizForm,
            questions: quizForm.questions.filter((q) => q.id !== questionId),
          });
        } else {
          console.error("Erreur lors de la suppression de la question");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la question:", error);
      }
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      correctAnswers: question.correctAnswers || [],
      category: question.category || "",
    });
    setShowEditQuestionModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (
      questionForm.question &&
      questionForm.optionA &&
      questionForm.optionB &&
      questionForm.optionC &&
      editingQuestion &&
      questionForm.correctAnswers.length > 0
    ) {
      try {
        // Préparer les données pour l'API Questions
        const questionData = {
          question: questionForm.question,
          answers: [questionForm.optionA, questionForm.optionB, questionForm.optionC],
          correctAnswers: questionForm.correctAnswers, // Utiliser directement le tableau
          category: questionForm.category, // Utiliser la catégorie de la question
          quizId: quizForm.id // Conserver l'association au quiz
        };

        // Envoyer la mise à jour au serveur
        const response = await fetch(`http://localhost:3000/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });

        if (response.ok) {
          const updatedQuestion = await response.json();

          // Mettre à jour la question dans le formulaire du quiz local
          const updatedQuestionForForm = {
            id: updatedQuestion._id,
            question: updatedQuestion.question,
            optionA: updatedQuestion.answers[0],
            optionB: updatedQuestion.answers[1],
            optionC: updatedQuestion.answers[2],
            correctAnswers: updatedQuestion.correctAnswers || [],
            category: updatedQuestion.category
          };

          setQuizForm({
            ...quizForm,
            questions: quizForm.questions.map(q =>
              q.id === editingQuestion.id ? updatedQuestionForForm : q
            ),
          });

          // Réinitialiser le formulaire et fermer le modal
          setQuestionForm({
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            correctAnswers: [],
            category: "",
          });
          setEditingQuestion(null);
          setShowEditQuestionModal(false);
        } else {
          const errorData = await response.json();
          alert(`Erreur lors de la modification de la question: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Erreur lors de la modification de la question:", error);
        alert("Erreur de connexion au serveur");
      }
    } else {
      alert("Veuillez remplir tous les champs et sélectionner au moins une bonne réponse");
    }
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswers: [],
      category: "",
    });
    setShowEditQuestionModal(false);
  };

  // Fonction pour gérer la sélection des réponses correctes multiples
  const handleCorrectAnswerChange = (answerLetter) => {
    const answerText = answerLetter === 'A' ? questionForm.optionA :
      answerLetter === 'B' ? questionForm.optionB :
        questionForm.optionC;

    let updatedCorrectAnswers = [...questionForm.correctAnswers];

    if (updatedCorrectAnswers.includes(answerText)) {
      // Si la réponse est déjà sélectionnée, la retirer
      updatedCorrectAnswers = updatedCorrectAnswers.filter(answer => answer !== answerText);
    } else {
      // Sinon, l'ajouter
      updatedCorrectAnswers.push(answerText);
    }

    setQuestionForm({
      ...questionForm,
      correctAnswers: updatedCorrectAnswers
    });
  };

  // === GESTION DES QUESTIONS EXISTANTES ===
  const handleShowExistingQuestions = () => {
    setShowExistingQuestionsModal(true);
    setSelectedExistingQuestions([]);
    setExistingQuestionsFilter({ category: "", searchText: "" });
  };

  const handleSelectExistingQuestion = (question) => {
    const isAlreadySelected = selectedExistingQuestions.some(q => q.id === question.id);
    const isAlreadyInQuiz = quizForm.questions.some(q => q.id === question.id);

    if (isAlreadyInQuiz) {
      alert("Cette question est déjà dans le quiz");
      return;
    }

    if (isAlreadySelected) {
      setSelectedExistingQuestions(selectedExistingQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedExistingQuestions([...selectedExistingQuestions, question]);
    }
  };

  const handleAddSelectedQuestions = async () => {
    if (selectedExistingQuestions.length === 0) {
      alert("Veuillez sélectionner au moins une question");
      return;
    }

    try {
      // Mettre à jour les questions sélectionnées avec le quizId du quiz actuel
      // et conserver leur catégorie d'origine
      const updatePromises = selectedExistingQuestions.map(question => {
        const questionData = {
          question: question.question,
          answers: [question.optionA, question.optionB, question.optionC],
          correctAnswers: question.correctAnswers,
          category: question.category,
          quizId: quizForm.id
        };

        return fetch(`http://localhost:3000/api/questions/${question.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
      });

      await Promise.all(updatePromises);

      // Ajouter les questions sélectionnées au quiz
      setQuizForm({
        ...quizForm,
        questions: [...quizForm.questions, ...selectedExistingQuestions],
      });

      // Mettre à jour la liste de toutes les questions
      const updatedAllQuestions = allQuestions.map(q => {
        const selectedQuestion = selectedExistingQuestions.find(sq => sq.id === q.id);
        if (selectedQuestion) {
          return { ...q, quizId: quizForm.id };
        }
        return q;
      });
      setAllQuestions(updatedAllQuestions);

      setShowExistingQuestionsModal(false);
      setSelectedExistingQuestions([]);
    } catch (error) {
      console.error("Erreur lors de l'ajout des questions:", error);
      alert("Erreur lors de l'ajout des questions");
    }
  };

  // Filtrer les questions existantes
  const getFilteredExistingQuestions = () => {
    return allQuestions.filter(question => {
      // Exclure les questions déjà dans le quiz actuel
      const isInCurrentQuiz = quizForm.questions.some(q => q.id === question.id);
      if (isInCurrentQuiz) return false;

      // Filtrer par catégorie
      if (existingQuestionsFilter.category && question.category !== existingQuestionsFilter.category) {
        return false;
      }

      // Filtrer par texte de recherche
      if (existingQuestionsFilter.searchText) {
        const searchLower = existingQuestionsFilter.searchText.toLowerCase();
        return question.question.toLowerCase().includes(searchLower) ||
          question.optionA.toLowerCase().includes(searchLower) ||
          question.optionB.toLowerCase().includes(searchLower) ||
          question.optionC.toLowerCase().includes(searchLower);
      }

      return true;
    });
  };

  // Obtenir les catégories uniques pour le filtre
  const getUniqueCategories = () => {
    const categories = [...new Set(allQuestions.map(q => q.category))];
    return categories.sort();
  };

  // Fonction pour recharger toutes les données depuis le serveur
  const reloadData = async () => {
    try {
      // Recharger les quiz
      const quizzesResponse = await fetch('http://localhost:3000/api/quizzes');
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData);
      }

      // Recharger toutes les questions
      const questionsResponse = await fetch('http://localhost:3000/api/questions');
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        const adaptedAllQuestions = questionsData.map(question => ({
          id: question._id,
          question: question.question,
          optionA: question.answers[0] || "",
          optionB: question.answers[1] || "",
          optionC: question.answers[2] || "",
          correctAnswers: question.correctAnswers || [],
          category: question.category,
          quizId: question.quizId
        }));
        setAllQuestions(adaptedAllQuestions);
      }
    } catch (error) {
      console.error("Erreur lors du rechargement des données:", error);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      if (quizForm.isNewQuiz) {
        // Créer un nouveau quiz dans la base de données
        const quizData = {
          title: quizForm.title,
          description: quizForm.description,
          category: quizForm.category,
          createdBy: currentUser ? currentUser.name : "Admin", // Utiliser l'utilisateur connecté
          isAutoGenerated: false
        };

        const response = await fetch('http://localhost:3000/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        });

        if (response.ok) {
          const newQuiz = await response.json();

          // Sauvegarder toutes les questions temporaires
          if (quizForm.questions.length > 0) {
            const createPromises = quizForm.questions.map(question => {
              if (question.isTemporary) {
                // Créer une nouvelle question pour les questions temporaires
                const questionData = {
                  question: question.question,
                  answers: [question.optionA, question.optionB, question.optionC],
                  correctAnswers: question.correctAnswers,
                  category: question.category,
                  quizId: newQuiz.id
                };

                return fetch('http://localhost:3000/api/questions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(questionData),
                });
              } else {
                // Mettre à jour les questions existantes avec le nouvel ID de quiz
                const questionData = {
                  question: question.question,
                  answers: [question.optionA, question.optionB, question.optionC],
                  correctAnswers: question.correctAnswers,
                  category: question.category,
                  quizId: newQuiz.id
                };

                return fetch(`http://localhost:3000/api/questions/${question.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(questionData),
                });
              }
            });

            await Promise.all(createPromises);
          }

          // Recharger les données
          await reloadData();
        } else {
          console.error("Erreur lors de la création du quiz:", await response.text());
        }
      } else if (editingQuiz) {
        // Mettre à jour un quiz existant
        const quizData = {
          title: quizForm.title,
          description: quizForm.description,
          category: quizForm.category,
          createdBy: currentUser ? currentUser.name : quizForm.createdBy || "Admin" // Préserver le créateur existant ou utiliser l'utilisateur connecté
        };

        const response = await fetch(`http://localhost:3000/api/quizzes/${editingQuiz.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        });

        if (response.ok) {
          // Recharger les données
          await reloadData();
        } else {
          console.error("Erreur lors de la mise à jour du quiz:", await response.text());
        }
      }

      setShowQuizModal(false);
      setEditingQuestion(null);
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
        <div className="admin-info">
          <div className="admin-stats">
            <div className="stat-badge">
              <FaUsers /> {users.length} utilisateurs
            </div>
            <div className="stat-badge">
              <FaQuestionCircle /> {quizzes.length} quiz
            </div>
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
                    {quiz.isAutoGenerated && (
                      <span className="quiz-auto-badge">Auto</span>
                    )}
                  </div>
                  <h3>{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                  <div className="quiz-meta">
                    <span>Créé le {quiz.createdAt}</span>
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
                  setUserForm({ id: "", name: "", email: "", role: "user", password: "" });
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
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                className="form-input"
                required
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
                required
              />
            </div>
            {!editingUser && (
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
            )}
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
                        <span className="question-category-badge" title={`Catégorie de la question: ${q.category || 'Non définie'}`}>
                          {q.category || 'Non définie'}
                        </span>
                        <div className="question-actions">
                          <button
                            onClick={() => handleEditQuestion(q)}
                            className="btn-remove btn-edit-question"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="btn-remove"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="question-content">
                        <p className="question-text">{q.question}</p>
                        <div className="options-preview">
                          <span
                            className={q.correctAnswers && q.correctAnswers.includes(q.optionA) ? "correct" : ""}
                          >
                            A) {q.optionA}
                          </span>
                          <span
                            className={q.correctAnswers && q.correctAnswers.includes(q.optionB) ? "correct" : ""}
                          >
                            B) {q.optionB}
                          </span>
                          <span
                            className={q.correctAnswers && q.correctAnswers.includes(q.optionC) ? "correct" : ""}
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

                <div className="form-group">
                  <label>Catégorie de la question</label>
                  <select
                    value={questionForm.category}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, category: e.target.value })
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
                    <label>Bonnes réponses (vous pouvez en sélectionner plusieurs)</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={questionForm.correctAnswers.includes(questionForm.optionA)}
                          onChange={() => handleCorrectAnswerChange('A')}
                          disabled={!questionForm.optionA}
                        />
                        <span className="checkbox-text">A: {questionForm.optionA || 'Option A'}</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={questionForm.correctAnswers.includes(questionForm.optionB)}
                          onChange={() => handleCorrectAnswerChange('B')}
                          disabled={!questionForm.optionB}
                        />
                        <span className="checkbox-text">B: {questionForm.optionB || 'Option B'}</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={questionForm.correctAnswers.includes(questionForm.optionC)}
                          onChange={() => handleCorrectAnswerChange('C')}
                          disabled={!questionForm.optionC}
                        />
                        <span className="checkbox-text">C: {questionForm.optionC || 'Option C'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="btn-add-question"
                  disabled={
                    !questionForm.question ||
                    !questionForm.optionA ||
                    !questionForm.optionB ||
                    !questionForm.optionC ||
                    !questionForm.category ||
                    questionForm.correctAnswers.length === 0
                  }
                >
                  + Ajouter cette question
                </button>
              </div>

              {/* Bouton pour ajouter des questions existantes */}
              <div className="existing-questions-section">

                <button
                  onClick={handleShowExistingQuestions}
                  className="btn-add-existing"
                >
                  📚 Ajouter des questions existantes
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
                onClick={() => {
                  setShowQuizModal(false);
                  setEditingQuestion(null);
                  setShowExistingQuestionsModal(false);
                  setShowEditQuestionModal(false);
                  setSelectedExistingQuestions([]);
                }}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Questions Existantes */}
      {showExistingQuestionsModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>Ajouter des questions existantes</h2>

            {/* Filtres */}
            <div className="filters-section">
              <div className="filter-row">
                <div className="form-group">
                  <label>Filtrer par catégorie</label>
                  <select
                    value={existingQuestionsFilter.category}
                    onChange={(e) =>
                      setExistingQuestionsFilter({
                        ...existingQuestionsFilter,
                        category: e.target.value
                      })
                    }
                    className="form-select"
                  >
                    <option value="">Toutes les catégories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rechercher dans les questions</label>
                  <input
                    type="text"
                    value={existingQuestionsFilter.searchText}
                    onChange={(e) =>
                      setExistingQuestionsFilter({
                        ...existingQuestionsFilter,
                        searchText: e.target.value
                      })
                    }
                    className="form-input"
                    placeholder="Tapez pour rechercher..."
                  />
                </div>
              </div>
            </div>

            {/* Informations sur la sélection */}
            <div className="selection-info">
              <p>
                {selectedExistingQuestions.length} question(s) sélectionnée(s) •
                {getFilteredExistingQuestions().length} question(s) disponible(s)
              </p>
              {selectedExistingQuestions.length > 0 && (
                <div className="selected-categories-info">
                  <small>
                    Catégories sélectionnées : {
                      [...new Set(selectedExistingQuestions.map(q => q.category))].join(', ')
                    }
                  </small>
                </div>
              )}
            </div>

            {/* Liste des questions */}
            <div className="existing-questions-list">
              {getFilteredExistingQuestions().length === 0 ? (
                <div className="no-questions">
                  <p>Aucune question disponible avec ces critères</p>
                </div>
              ) : (
                getFilteredExistingQuestions().map((question) => (
                  <div
                    key={question.id}
                    className={`existing-question-card ${selectedExistingQuestions.some(q => q.id === question.id) ? 'selected' : ''
                      }`}
                    onClick={() => handleSelectExistingQuestion(question)}
                  >
                    <div className="question-card-header">
                      <span className="question-category">{question.category}</span>
                      <input
                        type="checkbox"
                        checked={selectedExistingQuestions.some(q => q.id === question.id)}
                        onChange={() => handleSelectExistingQuestion(question)}
                        className="question-checkbox"
                      />
                    </div>
                    <div className="question-card-content">
                      <p className="question-text">{question.question}</p>
                      <div className="options-preview">
                        <span className={question.correctAnswers.includes(question.optionA) ? "correct" : ""}>
                          A) {question.optionA}
                        </span>
                        <span className={question.correctAnswers.includes(question.optionB) ? "correct" : ""}>
                          B) {question.optionB}
                        </span>
                        <span className={question.correctAnswers.includes(question.optionC) ? "correct" : ""}>
                          C) {question.optionC}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleAddSelectedQuestions}
                className="btn-save"
                disabled={selectedExistingQuestions.length === 0}
              >
                Ajouter {selectedExistingQuestions.length} question(s) sélectionnée(s)
              </button>
              <button
                onClick={() => {
                  setShowExistingQuestionsModal(false);
                  setSelectedExistingQuestions([]);
                }}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition de Question */}
      {showEditQuestionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modifier la question</h2>

            <div className="form-group">
              <label>Question</label>
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

            <div className="form-group">
              <label>Catégorie de la question</label>
              <select
                value={questionForm.category}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, category: e.target.value })
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
                <label>Bonnes réponses (vous pouvez en sélectionner plusieurs)</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={questionForm.correctAnswers.includes(questionForm.optionA)}
                      onChange={() => handleCorrectAnswerChange('A')}
                      disabled={!questionForm.optionA}
                    />
                    <span className="checkbox-text">A: {questionForm.optionA || 'Option A'}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={questionForm.correctAnswers.includes(questionForm.optionB)}
                      onChange={() => handleCorrectAnswerChange('B')}
                      disabled={!questionForm.optionB}
                    />
                    <span className="checkbox-text">B: {questionForm.optionB || 'Option B'}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={questionForm.correctAnswers.includes(questionForm.optionC)}
                      onChange={() => handleCorrectAnswerChange('C')}
                      disabled={!questionForm.optionC}
                    />
                    <span className="checkbox-text">C: {questionForm.optionC || 'Option C'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleUpdateQuestion}
                className="btn-save"
                disabled={
                  !questionForm.question ||
                  !questionForm.optionA ||
                  !questionForm.optionB ||
                  !questionForm.optionC ||
                  !questionForm.category ||
                  questionForm.correctAnswers.length === 0
                }
              >
                Mettre à jour la question
              </button>
              <button
                onClick={handleCancelEditQuestion}
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



//Je dois Admin Page
//Récupérer utilisateur/question
//Actuellement lorsque je crée un quiz avec une catégorie existante, la question est ajoutée à au quiz ayant la même catégorie
//Pouvoir intégrer au questionnaire, question existante
//Intégrér le questionnaire à la base de données ? 
