const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const userController = require('../controllers/userController');

// Route pour récupérer tous les utilisateurs
router.get('/users', userController.index);

// Route pour récupérer un utilisateur par son ID
router.get('/users/:id', userController.show);

// Route pour créer un nouvel utilisateur
router.post('/users/add', userController.create);

// Route pour mettre à jour un utilisateur
router.put('/users/update/:id', userController.update);

// Route pour supprimer un utilisateur
router.delete('/users/delete/:id', userController.delete);

module.exports = router;