const express = require("express");
const axios = require("axios");

const router = express.Router();

// Afficher la page d'inscription
router.get("/register", (req, res) => {
    const message = req.session.message || null; // Récupérer le message depuis la session
    req.session.message = null; // Réinitialiser le message après l'avoir utilisé
    res.render("register", { message }); // Passer le message à la vue
});

// Afficher la page de connexion
router.get("/login", (req, res) => {
    const message = req.session.message || null; // Récupère le message depuis la session
    req.session.message = null; // Réinitialise le message après l'avoir utilisé
    res.render("login", { message }); // Passe le message au template
});

// Gérer l'inscription
router.post("/register", async (req, res) => {
    const { nom, email, password, role, specialite, tarif, telephone, adresse } = req.body;
    console.log("Données envoyées à l'API :", { nom, email, password, role, specialite, tarif, telephone, adresse });

    try {
        const response = await axios.post("http://localhost:3000/api/auth/register", {
            nom,
            email,
            password,
            role,
            specialite,
            tarif,
            telephone,
            adresse
        });

        console.log("Réponse API :", response.data);

        if (response.status === 201) {
            req.session.message = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
            return res.redirect("/login");
        }
    } catch (error) {
        console.error("Erreur API :", error.response ? error.response.data : error.message);
        let message = "Erreur lors de l'inscription";
        if (error.response && error.response.data.message) {
            message = error.response.data.message;
        }
        req.session.message = message;
        return res.redirect("/register");
    }
});

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post("http://localhost:3000/api/auth/login", {
            email,
            password
        });

        if (response.data.token) {
            req.session.user = response.data.user;
            return res.redirect("/dashboard");
        }
    } catch (error) {
        req.session.message = "Erreur de connexion"; // Définir le message d'erreur
        return res.redirect("/login"); // Rediriger vers la page de connexion
    }
});

// Page protégée : Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.send(`<h2>Bienvenue ${req.session.user.nom} !</h2> <a href="/logout">Déconnexion</a>`);
});

// Déconnexion
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
