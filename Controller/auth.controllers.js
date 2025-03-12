// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');

// Function to generate access and refresh tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.JWT_SECRET, // Utilise directement la variable d'environnement
        { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.REFRESH_SECRET, // Utilise directement la variable d'environnement
        { expiresIn: '7d' }
    );
    console.log('Tokens générés:', { accessToken, refreshToken }); // Log pour déboguer
    return { accessToken, refreshToken };
};

// Register function
exports.register = async (req, res) => {
    try {
        const { nom, email, password, role, specialite, tarif, telephone, adresse } = req.body;

        if (!nom || !email || !password || !role) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        const userData = { nom, email, password: hashedPassword, role };

        if (role === "doctor") {
            if (!specialite || !tarif) {
                return res.status(400).json({ message: "Les champs spécialité et tarif sont obligatoires pour un médecin." });
            }
            newUser = new Doctor({ ...userData, specialite, tarif });
        } else if (role === "patient") {
            if (!telephone || !adresse) {
                return res.status(400).json({ message: "Les champs téléphone et adresse sont obligatoires pour un patient." });
            }
            newUser = new Patient({ ...userData, telephone, adresse });
        } else {
            return res.status(400).json({ message: "Rôle invalide. Choisissez 'doctor' ou 'patient'." });
        }

        await newUser.save();
        res.status(201).json({ message: "Utilisateur inscrit avec succès.", user: newUser });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.json({ success: true, accessToken, refreshToken, user });
    } catch (error) {
        console.error("Erreur de connexion :", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur", error: error.message });
    }
};

// Refresh token function
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Aucun refresh token fourni.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET); // Utilise directement la variable d'environnement
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé.' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        res.json({ success: true, accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token :', error.message);
        return res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré.' });
    }
};

module.exports = exports;