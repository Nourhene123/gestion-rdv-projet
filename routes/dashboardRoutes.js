const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');
const auth = require('../middlewares/auth.middleware');
const Appointment = require('../models/Appointment');

router.get('/',auth, dashboardController.getDashboard);
router.get("/doctorDashboard",auth, async (req, res) => {
    try {
      //const doctors = await Doctor.find();
      //console.log(token)
      const appointments = await Appointment.find({ doctor: req.user.userId })
              .populate("patient", "nom email telephone adresse") // Charger les infos du patient
              .sort("date");
              
              res.render("dashboardDoctor", { doctor: req.user, appointments });
    } catch (error) {
      console.error("Erreur lors de la récupération des docteurs :", error);
      res.status(500).send("Erreur serveur");
    }
  });
module.exports = router;