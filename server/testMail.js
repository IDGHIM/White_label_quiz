const sendMail = require("./src/utils/sendEmail");

(async () => {
  try {
    await sendMail({
      to: "damdiluca14@gmail.com",
      subject: "Test Email Nodemailer",
      html: "<p>Ceci est un test d’envoi de mail via Nodemailer 📩</p>",
    });
    console.log("✅ Email envoyé avec succès !");
  } catch (error) {
    console.error("❌ Erreur d’envoi :", error.response || error);
  }
})();
