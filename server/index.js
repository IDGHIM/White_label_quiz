const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/database/database");
const Question = require("./src/models/Questions");
const questionRouter = require("./src/routes/questionRoutes");
const userRouter = require("./src/routes/userRoutes");
const quizRouter = require("./src/routes/quizRoutes");
const authRouter = require("./src/routes/authRoutes");

const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "https://hackathon-quiz-4g3a.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//appel de la connection à la base de données
connectDB();

//Importation du routeur d'authentification
app.use("/auth", authRouter);

//Importation du routeur des questions
app.use(questionRouter);

//Importation du routeur des utilisateurs
app.use(userRouter);

//Importation du routeur des quiz
app.use(quizRouter);
