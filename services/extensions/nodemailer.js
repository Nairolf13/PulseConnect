require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Erreur de configuration :', error);
  } else {
    console.log('Serveur prêt à envoyer des emails');
  }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"PulseConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject:"PulseConnect",
            text
        });
        console.log("Email envoyé avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw error;
    }
};

module.exports = { transporter, sendEmail };
