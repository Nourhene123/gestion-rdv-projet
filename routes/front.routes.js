const express = require("express");
const axios = require("axios");
const auth = require('../middlewares/auth.middleware');
const Appointment = require("../models/Appointment");
const Doctor = require("../models/doctor");
const Availability = require("../models/Availability");
const router = express.Router();
const authMiddleWare = require('../middlewares/auth.middleware');

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
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      email,
      password
    });

    console.log('Réponse de /api/auth/login:', response.data);

    if (response.data.accessToken) {
      req.session.user = response.data.user;
      req.session.token = response.data.accessToken;

      return res.json({
        success: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user
      });
    } else {
      req.session.message = "Échec de l'authentification.";
      return res.status(401).json({ success: false, message: "Échec de l'authentification." });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error.response ? error.response.data : error.message);
    req.session.message = "Email ou mot de passe incorrect.";
    return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.render("dashboard", { user: req.session.user || {}, doctors });
  } catch (error) {
    console.error("Erreur lors de la récupération des docteurs :", error);
    res.status(500).send("Erreur serveur");
  }
});
router.get("/doctorDashboard", async (req, res) => {
  try {
    //const doctors = await Doctor.find();
    //console.log(token)
    const appointments = await Appointment.find({ doctor: req.session.user, date: { $gte: new Date() } })
            .populate("patient", "nom email telephone adresse") // Charger les infos du patient
            .sort("date");
            
            console.log("Données des rendez-vous envoyées à la vue :", JSON.stringify(appointments, null, 2));
            res.render("dashboardDoctor", { doctor: req.session.user || {}, appointments }); // Utilise session ou un objet vide
  } catch (error) {
    console.error("Erreur lors de la récupération des docteurs :", error);
    res.status(500).send("Erreur serveur");
  }
});


router.get('/appointments', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    const appointments = await Appointment.find({ patient: req.user.userId })
      .populate('doctor')
      .populate('patient');

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor')
      .populate('patient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé.' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous par ID :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Nouvelle route pour récupérer les disponibilités d'un médecin
router.get('/availabilities/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const availabilities = await Availability.find({
      doctor: doctorId,
      isBooked: false
    });
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Créer un rendez-vous avec vérification de disponibilité
router.post('/appointments', auth, async (req, res) => {
  try {
    const { appointmentDate, notes, doctorId } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    const requestedDate = new Date(appointmentDate);
    const availability = await Availability.findOne({
      doctor: doctorId,
      date: requestedDate,
      isBooked: false
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Cette date n\'est pas disponible pour ce médecin.'
      });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.userId,
      date: requestedDate,
      notes: notes || '',
      status: 'En attente'
    });

    availability.isBooked = true;
    await availability.save();

    const savedAppointment = await newAppointment.save();
    
    res.status(201).json({
      success: true,
      message: 'Rendez-vous réservé avec succès.',
      data: savedAppointment
    });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
// Route pour récupérer les disponibilités d'un médecin
router.get('/availabilities/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const availabilities = await Availability.find({
      doctor: doctorId,
      isBooked: false
    });
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Nouvelle route pour initialiser les disponibilités d'un médecin
router.post('/availabilities/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { startDate, endDate, interval } = req.body; // Par exemple : interval en minutes

    if (!startDate || !endDate || !interval) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir startDate, endDate et interval.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Médecin non trouvé.' });
    }

    // Générer des dates disponibles
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availabilities = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      // Vérifier si cette date n'existe pas déjà
      const existing = await Availability.findOne({
        doctor: doctorId,
        date: currentDate
      });

      if (!existing) {
        availabilities.push({
          doctor: doctorId,
          date: new Date(currentDate),
          isBooked: false
        });
      }
      currentDate.setMinutes(currentDate.getMinutes() + interval); // Ajouter l'intervalle
    }

    // Insérer les nouvelles disponibilités dans la base de données
    await Availability.insertMany(availabilities);

    res.status(201).json({
      success: true,
      message: `Disponibilités ajoutées avec succès pour le Dr. ${doctor.nom}.`,
      data: availabilities
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des disponibilités :', error);
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