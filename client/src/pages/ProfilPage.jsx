import React, { useState, useEffect } from "react";
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
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    createdAt: "2025-01-15",
    totalQuizzes: 12,
    averageScore: 78,
    bestScore: 95,
  });

  // États pour l'historique des quiz
  const [quizHistory, setQuizHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // État pour la modal de modification du profil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // État pour le formulaire de profil
  const [profileForm, setProfileForm] = useState({
    name: userData.name,
    email: userData.email,
  });

  // Chargement des données
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Simulation de chargement des données
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Historique des quiz joués
        setQuizHistory([
          {
            id: 1,
            quizTitle: "Quiz Mathématiques",
            category: "Sciences",
            score: 8,
            total: 10,
            percentage: 80,
            playedAt: "2025-01-25",
            duration: "5 min",
          },
          {
            id: 2,
            quizTitle: "Quiz Sciences",
            category: "Sciences",
            score: 9,
            total: 10,
            percentage: 90,
            playedAt: "2025-01-24",
            duration: "7 min",
          },
          {
            id: 3,
            quizTitle: "Quiz Géographie",
            category: "Géographie",
            score: 7,
            total: 10,
            percentage: 70,
            playedAt: "2025-01-23",
            duration: "6 min",
          },
          {
            id: 4,
            quizTitle: "Quiz Histoire",
            category: "Histoire",
            score: 10,
            total: 10,
            percentage: 100,
            playedAt: "2025-01-22",
            duration: "8 min",
          },
          {
            id: 5,
            quizTitle: "Culture Générale",
            category: "Culture",
            score: 6,
            total: 10,
            percentage: 60,
            playedAt: "2025-01-21",
            duration: "10 min",
          },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
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

  // Calculer les statistiques par catégorie
  const getCategoryStats = () => {
    const stats = {};
    quizHistory.forEach((quiz) => {
      if (!stats[quiz.category]) {
        stats[quiz.category] = {
          count: 0,
          totalScore: 0,
          avgScore: 0,
        };
      }
      stats[quiz.category].count++;
      stats[quiz.category].totalScore += quiz.percentage;
    });

    Object.keys(stats).forEach((category) => {
      stats[category].avgScore = Math.round(
        stats[category].totalScore / stats[category].count
      );
    });

    return stats;
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
          <h1>{userData.name}</h1>
          <p className="profil-email">{userData.email}</p>
          <p className="profil-member">Membre depuis {userData.createdAt}</p>
        </div>
        <button onClick={handleEditProfile} className="btn-edit-profile">
          <FaEdit /> Modifier le profil
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-cards">
        <div className="stat-card">
          <FaGamepad className="stat-icon" />
          <div className="stat-value">{userData.totalQuizzes}</div>
          <div className="stat-label">Quiz joués</div>
        </div>
        <div className="stat-card">
          <FaChartBar className="stat-icon" />
          <div className="stat-value">{userData.averageScore}%</div>
          <div className="stat-label">Score moyen</div>
        </div>
        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div className="stat-value">{userData.bestScore}%</div>
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
        <h2>
          <FaHistory /> Historique des quiz
        </h2>
        <div className="history-list">
          {quizHistory.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-info">
                <h3>{entry.quizTitle}</h3>
                <div className="history-meta">
                  <span className="category-tag">{entry.category}</span>
                  <span className="history-date">Joué le {entry.playedAt}</span>
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
      </div>

      {/* Modal Édition Profil */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <h2>Modifier le profil</h2>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="form-input"
                placeholder="Votre nom"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="form-input"
                placeholder="Votre email"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveProfile} className="btn-save">
                Sauvegarder
              </button>
              <button
                onClick={() => setShowEditProfileModal(false)}
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

export default ProfilPage;
