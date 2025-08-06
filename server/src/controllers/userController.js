const User = require('../models/Users');
const filter = require('leo-profanity');

// Initialisation du filtre des mots interdits avec les dictionnaires français et anglais
// Récupère les dictionnaires anglais et français
const englishDict = filter.getDictionary('en');
filter.loadDictionary('fr');
const frenchDict = filter.getDictionary('fr');

// Combine et ajoute les mots des deux dictionnaires ainsi que des mots personnalisés à la liste des mots interdits
filter.add([...englishDict, ...frenchDict]);
//console.log(filter.list()); // Afficher la liste des mots interdits




// Controller pour récupérer tous les utilisateurs
exports.index = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller pour récupérer un utilisateur par son ID
exports.show = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        console.log('Utilisateur récupéré:', user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller pour créer un nouvel utilisateur
exports.create = async (req, res) => {
    try {
        // Vérification des mots interdits dans le nom d'utilisateur et l'email
        const isBannedWord = filter.check(req.body.username);
        const isBannedEmail = filter.check(req.body.email);
        if (isBannedWord || isBannedEmail) {
            return res.status(400).json({ error: 'Le nom d\'utilisateur ou l\'email contient des mots interdits.' });
        }
        
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

// Controller pour mettre à jour un utilisateur
exports.update = async (req, res) => {
    try {
        // Si le mot de passe est vide, on ne le met pas à jour
        const updateData = { ...req.body };
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { 
            new: true,
            runValidators: true 
        });
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).json({ error: error.message });
    }
}

// Controller pour supprimer un utilisateur
exports.delete = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
