const mongoose = require('mongoose');
const User = require('../models/user');
const Doctor = User.discriminator('doctor', new mongoose.Schema({
    specialite: { type: String },
    tarif: { type: Number }
}));

module.exports = Doctor;
