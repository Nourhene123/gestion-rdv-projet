const express = require("express");
const axios = require("axios");
const auth = require('../middlewares/auth.middleware');
const Appointment = require("../models/Appointment");
const Doctor = require("../models/doctor"); // Assurez-vous que le modèle Doctor est correctement défini
const router = express.Router();

// Afficher la page d'inscription
router.get("/register", (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;
  res.render("register", { message });
});

// Afficher la page de connexion
router.get("/login", (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;
  res.render("login", { message });
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

// Gérer la connexion
// Après une connexion réussie dans votre route POST /login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password
      });
    
      if (response.data.token) {
        req.session.user = response.data.user;
        req.session.token = response.data.token; 
        return res.redirect("/dashboard"); // Ajoutez le token dans la réponse si nécessaire
      } else {
        req.session.message = "Échec de l'authentification.";
        return res.redirect("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error.response ? error.response.data : error.message);
      req.session.message = "Email ou mot de passe incorrect.";
      return res.redirect("/login");
    }
  });

// Page protégée : Dashboard
router.get("/dashboard", async (req, res) => {
    console.log("User in session:", req.session.user);
    if (!req.session.user) {
      return res.redirect("/login");
    }
  
    try {
      const doctors = await Doctor.find();
      res.render("dashboard", { user: req.session.user, doctors }); // user contient nom, email, etc.
    } catch (error) {
      console.error("Erreur lors de la récupération des docteurs :", error);
      res.status(500).send("Erreur serveur");
    }
  });

// Récupérer tous les rendez-vous
router.get('/appointments', auth, async (req, res) => {
    try {
      const appointments = await Appointment.find().populate('doctor').populate('patient');
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
});

router.post('/appointments', auth, async (req, res) => {
    try {
        const { appointmentDate, notes, doctorId } = req.body;

        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
        }

        const newAppointment = new Appointment({
            doctor: doctorId,
            patient: req.session.user._id, // From token via auth middleware
            date: new Date(appointmentDate),
            notes: notes || '',
            status: 'En attente'
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json({ success: true, message: 'Rendez-vous réservé avec succès.', data: savedAppointment });
    } catch (error) {
        console.error('Erreur lors de la création du rendez-vous :', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

// Déconnexion
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;