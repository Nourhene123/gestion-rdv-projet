const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    nom: { type: String },
    email: { required: true, unique: true, type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'patient' }, 
    telephone: { type: String }, 
    adresse: { type: String }, 
   
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
