import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from './pages/LoginPage';

const App = () => {
   return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/*page 404 */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </Router>
  );
};

export default App;
