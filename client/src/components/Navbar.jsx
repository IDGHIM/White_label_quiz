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
            </Link>
            <Link
              className="navbar-btn active"
              title="Connexion"
              aria-label="Connexion"
              to="/login"
            >
              <FiLogIn />
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
            </Link>
            <Link
              className="navbar-btn active"
              title="Profil"
              aria-label="Profil"
              to="/profil"
            >
              <FaUserCircle />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
