const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controllers'); // Importation du contrôleur

// Définir les routes pour l'inscription et la connexion
router.post('/register', authController.register);  // Gérer l'inscription
router.post('/login', authController.login);        // Gérer la connexion

// Routes pour l'affichage des formulaires (facultatif si tu utilises des vues)
router.get("/register", (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;
    res.render("register", { message });
});

router.get("/login", (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;
    res.render("login", { message });
});

module.exports = router;
