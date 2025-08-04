import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo">Hackathon Quizz</div>

      <div>
        <button
          className="navbar-btn"
          title="Accueil"
          aria-label="Accueil"
          onClick={() => navigate("/")}
        >
          <FiHome />
        </button>
        <button
          className="navbar-btn"
          title="Inscription"
          aria-label="Inscription"
          onClick={() => navigate("/register")}
        >
          <FaUserPlus />
        </button>
        <button
          className="navbar-btn"
          title="Déconnexion"
          aria-label="Déconnexion"
        >
          <FiLogOut />
        </button>
        <button 
          className="navbar-btn" 
          title="Connexion" 
          aria-label="Connexion"
          onClick={() => navigate("/login")}
        >
          <FiLogIn />
        </button>
        <button 
          className="navbar-btn" 
          title="Profil" 
          aria-label="Profil"
        >
          <FaUserCircle />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
