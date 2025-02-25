const mongoose = require('mongoose');
const User = require('../models/user'); // Import du modèle User

const Patient = User.discriminator('patient', new mongoose.Schema({
    telephone: { type: String },
    adresse: { type: String }
}));

module.exports = Patient;
