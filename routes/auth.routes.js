const express = require('express');
const router = express.Router();
const authController = require('../Controller/auth.controllers'); // Importation du contrôleur


router.post('/register', authController.register);  
router.post('/login', authController.login);  
router.post("/refresh", authController.refreshToken);      

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
