import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilPage.css";
import {
  FaUser,
  FaEdit,
  FaTrophy,
  FaGamepad,
  FaChartBar,
  FaHistory,
} from "react-icons/fa";

const ProfilPage = () => {
  // États pour les données utilisateur
  const [userData, setUserData] = useState({
    id: null,
    username: "",
    email: "",
    role: "user",
    createdAt: "",
  });

  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    historyCount: 0,
  });

  // États pour l'historique des quiz
  const [quizHistory, setQuizHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la modal de modification du profil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // État pour le formulaire de profil
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });

  // Fonction pour récupérer le token depuis localStorage ou cookies
  const getAuthToken = () => {
    // D'abord vérifier dans localStorage
    const token = localStorage.getItem("token");
    if (token) return token;

    // Sinon vérifier dans les cookies
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") return value;
    }
    return null;
  };

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // Charger les données du profil
  const loadUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError({ response });
          return;
        }
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();
      setUserData({
        id: data._id || data.id,
        username: data.username,
        email: data.email,
        role: data.role || "user",
        createdAt: new Date(data.createdAt).toLocaleDateString("fr-FR"),
      });

      setProfileForm({
        username: data.username,
        email: data.email,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setError("Impossible de charger le profil");
    }
  };

  // Charger les statistiques
  const loadUserStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/user/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError({ response });
          return;
        }
        // Si pas de stats, utiliser les valeurs par défaut
        if (response.status === 404) {
          setUserStats({
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            historyCount: 0,
          });
          return;
        }
        throw new Error("Erreur lors du chargement des statistiques");
      }

      const data = await response.json();
      setUserStats({
        totalQuizzes: data.totalQuizzes || 0,
        averageScore: Math.round(data.averageScore || 0),
        bestScore: data.bestScore || 0,
        historyCount: data.historyCount || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
      // Ne pas afficher d'erreur si c'est juste qu'il n'y a pas encore de stats
      setUserStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        historyCount: 0,
      });
    }
  };

  const loadQuizHistory = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/user/quiz-history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError({ response });
          return;
        }
        // Si pas d'historique, tableau vide
        if (response.status === 404) {
          setQuizHistory([]);
          return;
        }
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await response.json();

      // Formater les données pour l'affichage
      const formattedHistory = data.map((entry) => ({
        id: entry._id || entry.id,
        quizTitle: entry.quizTitle || entry.title || "Quiz sans titre",
        category: entry.category || "Non catégorisé",
        score: entry.score || 0,
        total: entry.totalQuestions || entry.total || 10,
        percentage:
          entry.percentage ||
          Math.round((entry.score / (entry.totalQuestions || 10)) * 100),
        playedAt: new Date(
          entry.playedAt || entry.createdAt
        ).toLocaleDateString("fr-FR"),
        duration: entry.duration || "Non renseigné",
      }));

      setQuizHistory(formattedHistory);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setQuizHistory([]);
    }
  };

  // Charger l'historique des quiz ici ...

  // Chargement des données
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Charger les données en parallèle pour gagner du temps
        await Promise.all([
          loadUserProfile(),
          loadUserStats(),
          loadQuizHistory(),
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Gestion du profil
  const handleEditProfile = () => {
    setProfileForm({
      name: userData.name,
      email: userData.email,
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Simulation de sauvegarde - À remplacer par un appel API
      setUserData({
        ...userData,
        name: profileForm.name,
        email: profileForm.email,
      });
      setShowEditProfileModal(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
    }
  };

  // Calcul des statistiques
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "score-excellent";
    if (percentage >= 60) return "score-good";
    if (percentage >= 40) return "score-average";
    return "score-poor";
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profil-container">
      {/* En-tête du profil avec statistiques */}
      <div className="profil-header">
        <div className="profil-avatar">
          <FaUser />
        </div>
        <div className="profil-info">
          <h1>{userData.username || "Utilisateur"}</h1>
          <p className="profil-email">
            {userData.email || "Email non renseigné"}
          </p>
          <p className="profil-member">
            Membre depuis {userData.createdAt || "Date inconnue"}
          </p>
          {userData.role === "admin" && (
            <span className="role-badge admin">Administrateur</span>
          )}
        </div>
        <button onClick={handleEditProfile} className="btn-edit-profile">
          <FaEdit /> Modifier le profil
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-cards">
        <div className="stat-card">
          <FaGamepad className="stat-icon" />
          <div className="stat-value">{userStats.totalQuizzes}</div>
          <div className="stat-label">Quiz joués</div>
        </div>
        <div className="stat-card">
          <FaChartBar className="stat-icon" />
          <div className="stat-value">{userStats.averageScore}%</div>
          <div className="stat-label">Score moyen</div>
        </div>
        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div className="stat-value">{userStats.bestScore}%</div>
          <div className="stat-label">Meilleur score</div>
        </div>
        <div className="stat-card">
          <FaHistory className="stat-icon" />
          <div className="stat-value">{quizHistory.length}</div>
          <div className="stat-label">Historique</div>
        </div>
      </div>

      {/* Historique des quiz */}
      <div className="history-section">
        <div className="history-header">
          <h2>
            <FaHistory /> Historique des quiz
          </h2>
          <button onClick={loadQuizHistory} className="btn-refresh">
            Rafraîchir
          </button>
        </div>

        {quizHistory.length === 0 ? (
          <div className="empty-history">
            <p>Vous n'avez pas encore joué de quiz</p>
            <button
              onClick={() => navigate("/quiz")}
              className="btn-start-quiz"
            >
              Commencer un quiz
            </button>
          </div>
        ) : (
          <div className="history-list">
            {quizHistory.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-info">
                  <h3>{entry.quizTitle}</h3>
                  <div className="history-meta">
                    <span className="category-tag">{entry.category}</span>
                    <span className="history-date">
                      Joué le {entry.playedAt}
                    </span>
                    <span className="history-duration">{entry.duration}</span>
                  </div>
                </div>
                <div className="history-score">
                  <div
                    className={`score-badge ${getScoreColor(entry.percentage)}`}
                  >
                    {entry.score}/{entry.total}
                  </div>
                  <div className="score-percentage">{entry.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Édition Profil */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <h2>Modifier le profil</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, username: e.target.value })
                }
                className="form-input"
                placeholder="Votre nom d'utilisateur"
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="form-input"
                placeholder="Votre email"
                disabled={isSaving}
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSaveProfile}
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => {
                  setShowEditProfileModal(false);
                  setError(null);
                }}
                className="btn-cancel"
                disabled={isSaving}
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

export default ProfilPage;
