const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/database/database');
const Question = require('./src/models/Questions');
const questionRouter = require('./src/routes/questionRoutes');
const userRouter = require('./src/routes/userRoutes'); 


// Middleware
app.use(express.json());
app.use(cookieParser());



//Tableau de questions pour initialiser la base de données
// const questions = [
//     {
//       question: "Quelle est la capitale de la France ?",
//       answers: ["Paris", "Lyon", "Marseille", "Toulouse"],
//       correctAnswer: "Paris",
//       category: "Géographie"
//     },
//     {
//       question: "Quel langage est utilisé pour styliser des pages web ?",
//       answers: ["HTML", "Python", "CSS", "C++"],
//       correctAnswer: "CSS",
//       category: "Informatique"
//     },
//     {
//       question: "Combien font 7 x 6 ?",
//       answers: ["42", "36", "48", "56"],
//       correctAnswer: "42",
//       category: "Maths"
//     }
//   ];

// //Définition du model de données pour les questions
// const QuestionSchema = new mongoose.Schema({
//   _id: { type: mongoose.Schema.ObjectId, auto: true },
//   question: { type: String, required: true },
//   answers: { type: [String], required: true },
//   correctAnswer: { type: String, required: true },
//   category: { type: String, required: true }
// });

// //Création du modèle Question
// const Question = mongoose.model('Question', QuestionSchema);


// //Création de connexion à MongoDB
// mongoose.connect('mongodb://localhost:27017/hackathon_quiz')
// .then( async () => {
//   console.log('MongoDB connected successfully')
//     // Insertion des questions dans la base de données
//     await Question.insertMany(questions);
//     console.log('Questions inserted successfully');



// }).catch(err => {
//   console.error('MongoDB connection error:', err);
// });


//Taleau des users pour initialiser la base de données
// const users = [
//   {
//     username: 'johnDoe',
//     email: 'john@example.com',
//     password: 'hashedpassword123', // à remplacer par un vrai hash
//     role: 'user',
//     resetToken: null,
//     resetTokenExpiration: null,
//   },
//   {
//     username: 'adminUser',
//     email: 'admin@example.com',
//     password: 'adminhashed456',
//     role: 'admin',
//     resetToken: null,
//     resetTokenExpiration: null,
//   },
//   {
//     username: 'janeSmith',
//     email: 'jane@example.com',
//     password: 'securepass789',
//     role: 'user',
//     resetToken: 'reset123token',
//     resetTokenExpiration: new Date(Date.now() + 3600000), // 1 heure plus tard
//   }
// ];

// //Définition du modèle de données pour les utilisateurs
// const UserSchema = new mongoose.Schema({
//   _id: { type: mongoose.Schema.ObjectId, auto: true },
//   username: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
//   resetToken: { type: String, default: null },
//   resetTokenExpiration: { type: Date, default: null }
// });

// //Création du modèle User
// const User = mongoose.model('User', UserSchema);

// //Création de connexion à MongoDB
// mongoose.connect('mongodb://localhost:27017/hackathon_quiz')
//   .then(() => {
//     console.log('MongoDB connected successfully');
//     // Insertion des utilisateurs dans la base de données
//     User.insertMany(users)
//       .then(() => {
//         console.log('Users inserted successfully');
//       })
//       .catch(err => {
//         console.error('Error inserting users:', err);
//       });
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//   });


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

//appel de la connection à la base de données
connectDB();

//Importation du routeur des questions
app.use(questionRouter);

//Importation du routeur des utilisateurs
app.use(userRouter);
