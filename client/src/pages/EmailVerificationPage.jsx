import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../styles/EmailVerificationPage.css'

const EmailVerificationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5173/api/verify/${token}`);
        console.log(res.data);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [token]);

return (
  <div className="email-verification-container">
    <div className="email-verification-content">
      <h1 className="verification-title">Vérification Email</h1>
      {status === "pending" && (
        <p className="verification-pending">Vérification en cours...</p>
      )}
      {status === "success" && (
        <p className="verification-success">Votre email a été vérifié avec succès !</p>
      )}
      {status === "error" && (
        <p className="verification-error">Le lien de vérification est invalide ou expiré.</p>
      )}
    </div>
  </div>
);
}

export default EmailVerificationPage;
