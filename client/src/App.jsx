import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import QuizPage from "./pages/QuizPage";
import ContactPage from "./pages/ContactPage";
import ProfilPage from "./pages/ProfilPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profil" element={<ProfilPage />} />
        {/* page 404 */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
