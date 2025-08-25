import React, { useState, useEffect } from "react";
import "../styles/QuizPage.css";

const QuizPage = () => {
  // États pour les questions et le chargement
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour gérer l'index de la question actuelle
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // États pour le score, les résultats et le démarrage du quiz
  const [score, setScore] = useState(0);
  // États pour afficher les résultats
  const [showResult, setShowResult] = useState(false);
  // États pour gérer le démarrage du quiz et les réponses
  const [quizStarted, setQuizStarted] = useState(false);
  // États pour stocker les réponses de l'utilisateur
  const [answers, setAnswers] = useState([]);
  // État pour stocker les réponses sélectionnées pour la question actuelle
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Fonction pour récupérer le quiz depuis l'API
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/quizzes');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug: afficher les données reçues
      console.log('Données reçues de l\'API:', data);
      console.log('Type des données:', typeof data);
      
      // Vérification que les données reçues sont valides
      if (data && Array.isArray(data) && data.length > 0) {
        // Si c'est un array de quiz, prendre le premier quiz
        if (data[0] && data[0].questions && Array.isArray(data[0].questions)) {
          console.log('Questions trouvées (format quiz array):', data[0].questions.length);
          setQuestions(data[0].questions);
        } else {
          // Si c'est directement un array de questions
          console.log('Questions trouvées (format array direct):', data.length);
          setQuestions(data);
        }
      } else if (data && data.questions && Array.isArray(data.questions)) {
        // Si les questions sont dans un objet wrapper
        console.log('Questions trouvées (format objet):', data.questions.length);
        setQuestions(data.questions);
      } else if (data && data.data && Array.isArray(data.data)) {
        // Format avec propriété data
        console.log('Questions trouvées (format data):', data.data.length);
        setQuestions(data.data);
      } else {
        console.error('Format de données non reconnu:', data);
        throw new Error(`Format de données invalide. Reçu: ${typeof data}`);
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement du quiz:', err);
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    fetchQuiz();
  }, []);

  // Question actuelle et nombre total de questions
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Lance le quiz : réinitialise toutes les valeurs
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswers([]);
    setShowResult(false);
  };

  // Gère la sélection d'une réponse (toggle pour sélections multiples)
  const handleAnswerSelection = (answer) => {
    const isMultipleChoice = currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1;
    
    if (isMultipleChoice) {
      // Pour les questions à choix multiples, toggle la sélection
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(a => a !== answer);
        } else {
          return [...prev, answer];
        }
      });
    } else {
      // Pour les questions à choix unique, sélection directe
      setSelectedAnswers([answer]);
      // Passer automatiquement à la question suivante
      setTimeout(() => submitAnswer([answer]), 500);
    }
  };

  // Valide les réponses sélectionnées
  const submitAnswer = (answersToSubmit = selectedAnswers) => {
    console.log("=== DEBUG RÉPONSE ===");
    console.log("Réponses sélectionnées:", answersToSubmit);
    console.log("correctAnswers (array):", currentQuestion.correctAnswers);
    console.log("Question actuelle:", currentQuestion);
    
    let isCorrect = false;
    let correctAnswersTexts = [];
    let selectedTexts = answersToSubmit.map(ans => currentQuestion[`option${ans}`]);
    
    // Vérifier si correctAnswers existe et est un tableau
    if (currentQuestion.correctAnswers && Array.isArray(currentQuestion.correctAnswers)) {
      correctAnswersTexts = currentQuestion.correctAnswers;
      
      // Pour une réponse correcte, toutes les bonnes réponses doivent être sélectionnées
      // et aucune mauvaise réponse ne doit être sélectionnée
      
      // Méthode 1: Comparer les textes des réponses
      const selectedTextsSet = new Set(selectedTexts);
      const correctTextsSet = new Set(correctAnswersTexts);
      
      isCorrect = selectedTextsSet.size === correctTextsSet.size &&
                  [...selectedTextsSet].every(text => correctTextsSet.has(text));
      
      // Méthode 2: Si la première ne fonctionne pas, comparer les lettres
      if (!isCorrect) {
        const selectedSet = new Set(answersToSubmit);
        const correctSet = new Set(currentQuestion.correctAnswers.filter(ans => ['A', 'B', 'C'].includes(ans)));
        
        if (correctSet.size > 0) {
          isCorrect = selectedSet.size === correctSet.size &&
                     [...selectedSet].every(ans => correctSet.has(ans));
        }
      }
    }
    
    console.log("Réponses correctes:", correctAnswersTexts);
    console.log("Textes sélectionnés:", selectedTexts);
    console.log("Est-ce correct ?", isCorrect);
    console.log("====================");
    
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Enregistre la réponse de l'utilisateur avec les détails de la question
    const answerData = {
      questionId: currentQuestion.id,
      selectedAnswers: answersToSubmit,
      selectedTexts: selectedTexts,
      correctAnswers: correctAnswersTexts,
      isCorrect: isCorrect,
      isMultipleChoice: correctAnswersTexts.length > 1,
    };

    // Ajoute la réponse à la liste des réponses
    setAnswers((a) => [...a, answerData]);

    // Réinitialise les sélections pour la question suivante
    setSelectedAnswers([]);

    // Passe à la question suivante ou affiche les résultats si c'est la dernière question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setShowResult(true);
    }
  };

  // Réinitialise le quiz : remet à zéro les états et permet de recommencer
  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
    setSelectedAnswers([]);
  };

  // Fonction pour recharger le quiz
  const reloadQuiz = () => {
    resetQuiz();
    fetchQuiz();
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <h2>Chargement du quiz...</h2>
          <p>Récupération des questions depuis le serveur</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-error">
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger le quiz : {error}</p>
          <div className="error-actions">
            <button onClick={fetchQuiz} className="retry-btn">
              Réessayer
            </button>
            <button onClick={() => window.location.href = "/"} className="home-btn">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz non démarré : affiche les informations du quiz et le bouton pour commencer
  if (!quizStarted) {
    return (
      <div className="quiz-container">
        <div className="quiz-welcome">
          <h1 className="quiz-title">Hackathon Quiz</h1>
          <div className="quiz-info">
            <div className="info-card">
              <h3>Informations du Quiz</h3>
              <ul>
                <li>
                  <strong>{totalQuestions} questions</strong>
                </li>
                <li>
                  <strong>QCM</strong> - Une seule bonne réponse
                </li>
                <li>
                  Score final sur <strong>{totalQuestions}</strong>
                </li>
              </ul>
            </div>
          </div>
          <div className="quiz-actions">
            <button onClick={startQuiz} className="start-quiz-btn">
              Commencer le Quiz
            </button>
            <button onClick={reloadQuiz} className="reload-btn">
              Recharger le Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affiche les résultats détaillés avec les réponses de l'utilisateur
  if (showResult) {
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h1 className="result-title">Résultats du Quiz</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {totalQuestions}</span>
            </div>
            <div className="score-percentage">
              {Math.round((score / totalQuestions) * 100)}%
            </div>
          </div>

          <div className="detailed-results">
            <h3>Détail des réponses</h3>
            {answers.map((answer, index) => (
              <div key={answer.questionId} className="result-item">
                <div className="result-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span
                    className={`result-status ${
                      answer.isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="result-details">
                  <p>
                    <strong>Question:</strong> {questions[index].question}
                  </p>
                  <p>
                    <strong>Votre réponse:</strong>{" "}
                    {answer.selectedTexts ? answer.selectedTexts.join(", ") : 
                     (answer.selectedText || answer.selectedAnswer || "Pas de réponse")}
                  </p>
                  {!answer.isCorrect && (
                    <p>
                      <strong>Bonne réponse:</strong> {
                        Array.isArray(answer.correctAnswers) ? 
                        answer.correctAnswers.join(", ") : 
                        answer.correctAnswers
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button onClick={resetQuiz} className="retry-btn">
              Recommencer
            </button>
            <button onClick={reloadQuiz} className="reload-btn">
              Nouveau Quiz
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="home-btn"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affiche le quiz en cours avec la question actuelle et les options de réponse
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="progress-section">
          <div className="question-counter">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="score-display-mini">
          {score}/{totalQuestions}
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h2 className="question-text">{currentQuestion.question}</h2>
          
          {/* Indicateur du type de question */}
          <div className="question-type-indicator">
            {currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1 ? (
              <p className="multiple-choice-hint">
                📋 <strong>Choix multiple</strong> - Sélectionnez toutes les bonnes réponses ({currentQuestion.correctAnswers.length} réponses attendues)
              </p>
            ) : (
              <p className="single-choice-hint">
                ✅ <strong>Choix unique</strong> - Une seule bonne réponse
              </p>
            )}
          </div>

          <div className="options-container">
            {["A", "B", "C"].map((option) => (
              <button
                key={option}
                className={`option-btn ${selectedAnswers.includes(option) ? 'selected' : ''}`}
                onClick={() => handleAnswerSelection(option)}
              >
                <span className="option-letter">{option}</span>
                <span className="option-text">
                  {currentQuestion[`option${option}`]}
                </span>
                {selectedAnswers.includes(option) && (
                  <span className="selected-indicator">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Bouton de validation pour les questions à choix multiples */}
          {currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1 && (
            <div className="submit-section">
              <button 
                className="submit-btn" 
                onClick={() => submitAnswer()}
                disabled={selectedAnswers.length === 0}
              >
                Valider ma réponse ({selectedAnswers.length} sélectionnée{selectedAnswers.length > 1 ? 's' : ''})
              </button>
              {selectedAnswers.length > 0 && (
                <button 
                  className="clear-btn" 
                  onClick={() => setSelectedAnswers([])}
                >
                  Effacer les sélections
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;