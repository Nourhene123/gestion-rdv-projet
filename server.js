require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require('./routes/auth.routes');

const frontRoutes = require("./routes/front.routes");


const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express(); // Initialisation d'Express (doit être avant app.use)
const port = process.env.PORT || 3000; // Permet d'utiliser un port dynamique (ex: en production)

// 🚀 Vérification des variables d'environnement
if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
  console.error(" Erreur : MONGO_URL ou JWT_SECRET n'est pas défini dans le fichier .env");
  process.exit(1);
}

//  Configuration du moteur de template EJS
app.set("view engine", "ejs");

// 🛠️ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Remplace bodyParser.json()

//  Configuration CORS (ajouter plus d'origines si nécessaire)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//  Configuration des sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Activer HTTPS en production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
  })
);

//  Routes API
app.use("/api/auth", authRoutes);
app.use("/", frontRoutes);
app.use("/appointments", appointmentRoutes); 

//  Gestion des erreurs 404 (Route non trouvée)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(" Erreur serveur :", err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur", error: err.message });
});


//connexion à la base de données
  mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
// 🚀 Démarrage du serveur
app.listen(port, () => {
  console.log(` Serveur démarré sur http://localhost:${port}`);
});
