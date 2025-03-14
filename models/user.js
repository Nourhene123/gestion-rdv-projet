const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['patient', 'doctor'] } ,
    telephone: { type: String },
    adresse: { type: String }
}, { timestamps: true, discriminatorKey: 'role' });

const User = mongoose.model('User', userSchema);
module.exports = User;
