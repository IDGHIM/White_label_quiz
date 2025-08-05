const User = require('../models/Users');


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
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Controller pour mettre à jour un utilisateur
exports.update = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
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
