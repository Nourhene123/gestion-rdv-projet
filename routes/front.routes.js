const express = require("express");
const auth = require('../middlewares/auth.middleware');
const Appointment = require("../models/Appointment");
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');


router.get('/appointments', auth, appointmentController.createAppointment) ;

// Nouvelle route : Récupérer un rendez-vous spécifique par ID (sans restriction d'utilisateur)
router.get('/appointments/:id', auth, async (req, res) => {
  try {
      const appointmentId = req.params.id; // Récupérer l'ID depuis les paramètres de l'URL

      // Trouver le rendez-vous par ID, sans vérifier l'utilisateur connecté
      const appointment = await Appointment.findById(appointmentId)
          .populate('doctor') // Peupler les détails du médecin
          .populate('patient'); // Peupler les détails du patient

      if (!appointment) {
          return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé.' });
      }

      res.status(200).json({ success: true, data: appointment });
  } catch (error) {
      console.error('Erreur lors de la récupération du rendez-vous par ID :', error);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
router.post('/appointments', auth, async (req, res) => {
  try {
    const { appointmentDate, notes, doctorId } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.userId, // Use the decoded userId from the token
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




module.exports = router;