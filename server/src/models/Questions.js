const mongoose = require('mongoose');

//Définition du schéma pour les questions

const QuestionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  question: { type: String, required: true },
  answers: { type: [String], required: true }, 
  correctAnswers: { type: [String] }, 
  category: { type: String, required: true }
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
