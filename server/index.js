// index.js - Backend sur port 3001
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/database/database");
const Question = require("./src/models/Questions");
const questionRouter = require("./src/routes/questionRoutes");
const userRouter = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const dotenv = require("dotenv");
dotenv.config();
const sendEmail = require("./src/utils/sendEmail");
const cors = require("cors");

app.get("/hello", (req, res) => {
  res.send("Hello world!");
});

// Middleware CORS - Frontend Vite sur port 5173, Backend sur port 3001
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Appel de la connexion à la base de données
connectDB();

// Importation du routeur des questions
app.use("/api/questions", questionRouter);

// Importation du routeur des utilisateurs
app.use("/api/users", userRouter);

app.use("/auth", authRoutes);

// Serveur sur port 3001
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});