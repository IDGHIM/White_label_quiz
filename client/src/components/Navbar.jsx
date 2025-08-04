import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Hackathon Quizz</div>

      <div>
        <button
          className="navbar-btn"
          title="Inscription"
          aria-label="Inscription"
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
        <button className="navbar-btn" title="Connexion" aria-label="Connexion">
          <FiLogIn />
        </button>
        <button className="navbar-btn" title="Profil" aria-label="Profil">
          <FaUserCircle />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
