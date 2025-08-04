const express = require('express');
const router = express.Router();
const Question = require('../models/Questions');
const questionController = require('../controllers/questionController');

// Route pour récupérer toutes les questions
router.get('/questions', questionController.index);
 
// Route pour récupérer une question par son ID
router.get('/questions/:id', questionController.show);

// Route pour créer une nouvelle question
//Model: POST /questions/add
//Exmeple de structure 
// {
//   "question": "Quel est le plus grand océan du monde ?",
//   "answers": ["Océan Atlantique", "Océan Pacifique", "Océan Indien", "Océan Arctique"],
//   "correctAnswer": "Océan Pacifique",
//   "category": "Géographie"
// }
router.post('/questions/add', questionController.create);


// Route pour mettre à jour une question
router.put('/questions/update/:id', questionController.update);


// Route pour supprimer une question
router.delete('/questions/delete/:id', questionController.delete);

module.exports = router;