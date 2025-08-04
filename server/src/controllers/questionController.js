const Question = require('../models/Questions');


//Controller pour récupérer toutes les questions
exports.index = async (req, res) => {
       try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Controller pour récupérer une question par son ID
exports.show = async (req, res) => {
      try {
        const questionId = req.params.id;
        const question = await Question.findById(questionId);
        console.log('Question récupérée:', question);
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Controller pour créer une nouvelle question
exports.create = async (req, res) => {
      try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//Controller pour mettre à jour une question
exports.update = async (req, res) => {
      try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }
        res.json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//Controller pour supprimer une question
exports.delete = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }
        res.json({ message: 'Question supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}