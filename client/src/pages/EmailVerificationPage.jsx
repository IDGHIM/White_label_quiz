import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"


const EmailVerificationPage = () => {

    const { token } = useParams()
    const [ status, setStatus ] = useState()

    useEffect(() => {
        const verifyEmail = async () => {
          try {
            const res = await axios.get(`http://localhost:5000/auth/verify/${token}`, {
            });
            console.log(res.data);
            setStatus("success");
          } catch (err) {
            console.error(err);
            setStatus("error");
          }
        };
        verifyEmail();
    }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
    {status === "pending" && <p>Vérification en cours...</p>}
    {status === "success" && <p>Votre email a été vérifié avec succès !</p>}
    {status === "error" && <p>Le lien de vérification est invalide ou expiré.</p>}
  </div>
  )
}

export default EmailVerificationPage