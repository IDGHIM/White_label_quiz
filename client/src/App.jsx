import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import QuizPage from "./pages/QuizPage";
import ContactPage from "./pages/ContactPage"; 

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password:token" element={<ResetPasswordPage />} />
        {/* Admin route */}
        <Route path="/admin" element={<AdminPage />} />
        {/* page 404 */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;