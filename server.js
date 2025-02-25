const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const cors = require("cors"); // Ajout de CORS
const authRoutes = require("./routes/auth.routes");

const app = express();
const port = 3000;

// Vérification des variables d'environnement
if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
  console.error("Erreur : MONGO_URL ou JWT_SECRET n'est pas défini dans le fichier .env");
  process.exit(1);
}

// Configuration du moteur de template EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Remplacement de bodyParser.json() par express.json()

// Configuration de CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Autoriser uniquement le frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP autorisées
    credentials: true, // Autoriser les cookies et les credentials
  })
);

// Configuration des sessions
app.use(
  session({
    secret: process.env.JWT_SECRET || "secret-key", // Utiliser JWT_SECRET pour la clé secrète
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // À mettre à `true` en production avec HTTPS
      httpOnly: true, // Empêcher l'accès au cookie via JavaScript
      maxAge: 1000 * 60 * 60 * 24, // Durée de vie du cookie : 1 jour
    },
  })
);

// Routes API
app.use("/api/auth", authRoutes);

// Routes pour le front-end
const frontRoutes = require("./routes/front.routes");
app.use("/", frontRoutes);

// Gestion des erreurs 404 (Route non trouvée)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur globale :", err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion à MongoDB :", err));

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
