import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/mentions-legales" className="footer-link">
          Mentions légales
        </Link>
        <Link to="/licence" className="footer-link">
          Licence
        </Link>
        <Link to="/contact" className="footer-link">
          Contact
        </Link>
      </div>
      <div className="footer-copyright">
        © 2025 Hackathon Quizz - Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
