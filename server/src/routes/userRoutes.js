const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// ======================
// 🔒 Routes protégées
// ======================

// ✅ Tous les utilisateurs connectés peuvent voir la liste
router.get("/api/users", protect, userController.index);

// ✅ Tous les utilisateurs connectés peuvent voir un utilisateur par son ID
router.get("/api/users/:id", protect, userController.show);

// ✅ Uniquement les admins peuvent créer un utilisateur
router.post("/api/users", protect, authorize("admin"), userController.create);

// ✅ Uniquement les admins peuvent modifier un utilisateur
router.put("/api/users/:id", protect, authorize("admin"), userController.update);

// ✅ Uniquement les admins peuvent supprimer un utilisateur
router.delete("/api/users/:id", protect, authorize("admin"), userController.delete);

// ✅ Exemple de route spéciale admin
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Bienvenue admin !" });
});

module.exports = router;
