const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Tester si je récupère mes variables
console.log(process.env.GMAIL_USER);
console.log(process.env.EMAIL_FROM_NAME);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Hackathon_Quiz" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email envoyé", info.messageId);
  } catch (error) {
    console.error(`Erreur lors de l'envoi`, error);
    throw new Error(`Erreur lors de l'envoi de l'email`);
  }
}

module.exports = sendMail;
