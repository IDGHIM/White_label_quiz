import "../styles/Navbar.css";
import { Link } from "react-router-dom";
import { FaUserCircle, FaUserPlus } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiHome } from "react-icons/fi";

// Simule l'état
const isLoggedIn = false;

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Hackathon Quiz
      </Link>
      <div>
        <Link
          className="navbar-btn active"
          title="Accueil"
          aria-label="Accueil"
          to="/"
        >
          <FiHome />
        <span className="tooltip">Accueil</span>
        </Link>

        {!isLoggedIn && (
          <>
            <Link
              className="navbar-btn active"
              title="Inscription"
              aria-label="Inscription"
              to="/register"
            >
              <FaUserPlus />
              <span className="tooltip">Inscription</span>
            </Link>
            <Link
              className="navbar-btn active"
              title="Connexion"
              aria-label="Connexion"
              to="/login"
            >
              <FiLogIn />
              <span className="tooltip">Connexion</span>
            </Link>
          </>
        )}

        {isLoggedIn && (
          <>
            <Link
              className="navbar-btn active"
              title="Déconnexion"
              aria-label="Déconnexion"
              to="/logout"
            >
              <FiLogOut />
              <span className="tooltip">Déconnexion</span>
            </Link>
            <Link
              className="navbar-btn active"
              title="Profil"
              aria-label="Profil"
              to="/profil"
            >
              <FaUserCircle />
              <span className="tooltip">Profil</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
