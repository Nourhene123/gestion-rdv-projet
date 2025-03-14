const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');
const auth = require('../middlewares/auth.middleware');
const Appointment = require('../models/Appointment');
const dashboardDoctorController = require('../Controller/dashboardDoctorController');

router.get('/',auth, dashboardController.getDashboard);
router.get("/doctorDashboard",auth,dashboardDoctorController.getDoctorDashboard); 
module.exports = router;