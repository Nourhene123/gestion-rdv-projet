const { get } = require('mongoose');
const Doctor = require('../models/doctor');

exports.getDashboard = async (req, res) => {
    console.log('Utilisateur connecté:', req.user);
    const doctors = await Doctor.find();
  res.render('dashboard', { user: req.user, doctors,role:req.user.role });
};