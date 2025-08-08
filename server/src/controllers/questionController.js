const Question = require('../models/Questions');
const Quiz = require('../models/Quiz');
const filter = require('leo-profanity');

// Initialisation du filtre des mots interdits avec les dictionnaires français et anglais
// Récupère les dictionnaires anglais et français
const englishDict = filter.getDictionary('en');
filter.loadDictionary('fr');
const frenchDict = filter.getDictionary('fr');

// Combine et ajoute les mots des deux dictionnaires ainsi que des mots personnalisés à la liste des mots interdits
filter.add([...englishDict, ...frenchDict]);
//console.log(filter.list()); // Afficher la liste des mots interdits


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
        
        // Validation des réponses correctes
        if (!req.body.correctAnswer && (!req.body.correctAnswers || req.body.correctAnswers.length === 0)) {
            return res.status(400).json({ error: 'Au moins une réponse correcte doit être fournie.' });
        }
        
        //Vérification des mots interdits dans la question, les réponses et la catégorie 
         const isBannedWord = filter.check(req.body.question);
         const isBannedAnswer = req.body.answers.some(answer => filter.check(answer));
         const isBannedCategory = filter.check(req.body.category);
         if (isBannedWord || isBannedAnswer || isBannedCategory) {
                    return res.status(400).json({ error: 'La question, une réponse ou la catégorie contient des mots interdits.' });
                }

        const newQuestion = new Question(req.body);
        await newQuestion.save();
        
        // Mettre à jour le compteur de questions du quiz si la question est associée à un quiz
        if (req.body.quizId) {
            const quiz = await Quiz.findById(req.body.quizId);
            if (quiz) {
                const questionsCount = await Question.countDocuments({ quizId: req.body.quizId });
                quiz.questionsCount = questionsCount;
                await quiz.save();
            }
        }
        
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//Controller pour mettre à jour une question
exports.update = async (req, res) => {
      try {
        // Validation des réponses correctes
        if (!req.body.correctAnswer && (!req.body.correctAnswers || req.body.correctAnswers.length === 0)) {
            return res.status(400).json({ error: 'Au moins une réponse correcte doit être fournie.' });
        }
        
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
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }
        
        const quizId = question.quizId;
        
        await Question.findByIdAndDelete(req.params.id);
        
        // Mettre à jour le compteur de questions du quiz si la question était associée à un quiz
        if (quizId) {
            const quiz = await Quiz.findById(quizId);
            if (quiz) {
                const questionsCount = await Question.countDocuments({ quizId: quizId });
                quiz.questionsCount = questionsCount;
                await quiz.save();
            }
        }
        
        res.json({ message: 'Question supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}