const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/user'); 
const Doctor = require('../models/doctor'); 
const Patient = require('../models/patient'); 

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';






exports.register = async (req, res) => {
    try {
        const { nom, email, password, role, specialite, tarif, telephone, adresse } = req.body;

        if (!nom || !email || !password || !role) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === "doctor") {
            if (!specialite || !tarif) {
                return res.status(400).json({ message: "Les champs spécialité et tarif sont obligatoires pour un médecin." });
            }
            newUser = new Doctor({ nom, email, password: hashedPassword, role, specialite, tarif });
        } else if (role === "patient") {
            if (!telephone || !adresse) {
                return res.status(400).json({ message: "Les champs téléphone et adresse sont obligatoires pour un patient." });
            }
            newUser = new Patient({ nom, email, password: hashedPassword, role, telephone, adresse });
        } else {
            return res.status(400).json({ message: "Rôle invalide." });
        }

        await newUser.save();
        res.status(201).json({ message: "Utilisateur inscrit avec succès.", user: newUser });

    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur lors de l'inscription", error });
    }
};




// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email }) || await Doctor.findOne({ email }) || await Patient.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ success: true, token, user });

    } catch (error) {
        console.error("Erreur de connexion :", error);
        res.status(500).json({ success: false, message: "Erreur lors de la connexion", error: error.message });
    }
};