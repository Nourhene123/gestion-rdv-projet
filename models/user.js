const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: { type: String}, 
    email: { required: true, unique: true, type: String },
    password: { type: String, required: true }, 
    role: { type: String, required: true, default: "patient" }, 
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);
