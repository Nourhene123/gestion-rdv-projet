const express = require("express");
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');
const auth  = require('../middlewares/auth.middleware');

router.get('/',auth,appointmentController.getCalendar);

module.exports = router;