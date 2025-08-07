// index.js - Backend sur port 3001
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./src/database/database');
const Question = require('./src/models/Questions');
const questionRouter = require('./src/routes/questionRoutes');
const userRouter = require('./src/routes/userRoutes');
const quizRouter = require('./src/routes/quizRoutes'); 

app.use(express.json());
app.use(cookieParser());

// Appel de la connexion à la base de données
connectDB();

// Importation du routeur des questions
app.use("/api/questions", questionRouter);

//Importation du routeur des utilisateurs
app.use(userRouter);

//Importation du routeur des quiz
app.use(quizRouter);
