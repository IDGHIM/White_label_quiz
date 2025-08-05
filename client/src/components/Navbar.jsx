import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo">Hackathon Quizz</div>

      <div>
        <Link to="/register" title="Inscription" aria-label="Inscription">
          <FaUserPlus />
        </Link>
        <button
          className="navbar-btn active"
          title="Déconnexion"
          aria-label="Déconnexion"
        >
          <FiLogOut />
        </button>
        <Link
          to="/login"
          className="navbar-btn"
          title="Connexion"
          aria-label="Connexion"
        >
          <FiLogIn />
        </Link>
        <Link
          to="/profil"
          className="navbar-btn"
          title="Profil"
          aria-label="Profil"
        >
          <FaUserCircle />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
