const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    nom: { type: String },
    email: { required: true, unique: true, type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'doctor' }, 
    specialite: { type: String }, 
    tarif: { type: Number }, 
 
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
