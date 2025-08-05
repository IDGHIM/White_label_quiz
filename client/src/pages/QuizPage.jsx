import React, { useState } from "react";
import "../styles/QuizPage.css";

const QuizPage = () => {
  // Liste des questions du quiz (stockées en local ici, mais viendront plus tard d'une API)
  const [questions] = useState([
    {
      id: 1,
      question:
        "En quelle année a eu lieu la chute de l'Empire romain d'Occident ?",
      optionA: "395",
      optionB: "410",
      optionC: "476",
      correctAnswer: "C",
    },
    {
      id: 2,
      question: "Quelle est la formule chimique de l'eau ?",
      optionA: "H2O",
      optionB: "CO2",
      optionC: "O2",
      correctAnswer: "A",
    },
    {
      id: 3,
      question: "Quelle est la capitale de l'Australie ?",
      optionA: "Sydney",
      optionB: "Melbourne",
      optionC: "Canberra",
      correctAnswer: "C",
    },
    {
      id: 4,
      question: "Qui a écrit 'Les Misérables' ?",
      optionA: "Émile Zola",
      optionB: "Victor Hugo",
      optionC: "Gustave Flaubert",
      correctAnswer: "B",
    },
    {
      id: 5,
      question: "Combien de planètes y a-t-il dans notre système solaire ?",
      optionA: "8",
      optionB: "9",
      optionC: "7",
      correctAnswer: "A",
    },
  ]);

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

  // Question actuelle et nombre total de questions
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Lance le quiz : réinitialise toutes les valeurs
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
  };

  // Gère la réponse de l'utilisateur : vérifie si elle est correcte, met à jour le score et les réponses
  // Passe à la question suivante ou affiche les résultats si c'est la dernière question
  const handleAnswer = (answer) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Enregistre la réponse de l'utilisateur avec les détails de la question
    const answerData = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: isCorrect,
    };

    // Ajoute la réponse à la liste des réponses
    setAnswers((a) => [...a, answerData]);

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
  };

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
          <button onClick={startQuiz} className="start-quiz-btn">
            Commencer le Quiz
          </button>
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
                    {answer.selectedAnswer || "Pas de réponse"}
                  </p>
                  {!answer.isCorrect && (
                    <p>
                      <strong>Bonne réponse:</strong> {answer.correctAnswer}
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

          <div className="options-container">
            {["A", "B", "C"].map((option) => (
              <button
                key={option}
                className="option-btn"
                onClick={() => handleAnswer(option)}
              >
                <span className="option-letter">{option}</span>
                <span className="option-text">
                  {currentQuestion[`option${option}`]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
