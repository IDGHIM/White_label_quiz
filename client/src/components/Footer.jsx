import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <nav className="footer-navigation">
        <Link to="/legal-notice" className="footer-nav-link">
          Mentions légales
        </Link>
        <Link to="/licence" className="footer-nav-link">
          Licence
        </Link>
        <Link to="/contact" className="footer-nav-link">
          Contact
        </Link>
      </nav>
      <div className="footer-copyright-section">
        © 2025 Quiz App - Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;