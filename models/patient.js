const mongoose = require('mongoose');
const User = require('../models/user'); // Import du modèle User

const Patient = User.discriminator('patient', new mongoose.Schema({
   DossierMedical: { type: String, required: false },
}));

module.exports = Patient;
