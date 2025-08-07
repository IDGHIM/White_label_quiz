const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Protection de toutes les routes
router.use(protect);

// Route pour récupérer tous les utilisateurs
router.get("/", userController.index);

// Route pour récupérer un utilisateur par son ID
router.get("/:id", userController.show);

// Route pour créer un nouvel utilisateur
router.post("/", userController.create);

// Route pour modifier un utilisateur
router.put("/:id", userController.update);

// Route pour supprimer un utilisateur
router.delete("/:id", userController.delete);

// Route uniquement accessible aux admins
router.get("/admin", authorize("admin"), (req, res) => {
  res.json({ message: "Bienvenue admin !" });
});

module.exports = router;
