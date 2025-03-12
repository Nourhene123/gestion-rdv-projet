const express = require('express');
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');
const  authController = require('../Controller/auth.controllers');
const auth = require('../middlewares/auth.middleware'); 
router.post('/appointments', auth, appointmentController.createAppointment);
router.get('/appointments', auth, appointmentController.getAllAppointments); 
router.put('/appointments/:id', auth, appointmentController.updateAppointmentStatus);


module.exports = router;
