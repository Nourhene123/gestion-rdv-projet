require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const cookieParser = require("cookie-parser");
const http = require("http");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const { initializeNotificationSystem } = require("./notificationSystem");

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize the notification system
initializeNotificationSystem(server);

// 🚀 Vérification des variables d'environnement
if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
  console.error("Erreur : MONGO_URL ou JWT_SECRET n'est pas défini dans le fichier .env");
  process.exit(1);
}

// Configuration du moteur de template EJS
app.set("view engine", "ejs");
app.use(cookieParser());

// 🛠️ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Configuration CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Configuration des sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
  })
);

// Routes API

app.get("/", (req, res) => {
  const token = req.cookies.accessToken; 
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log('Token décodé:', decoded);
          req.user = decoded;
  console.log("userrrrrrr:",decoded)
  console.log("userrrrrrr ROLE:",decoded.role)
  if(decoded.role === 'doctor'){
    res.redirect("/dashboard/doctorDashboard");
  }
  else if(decoded.role === 'patient'){
    res.redirect("/dashboard");
  }
  else{
    res.redirect("/login");
  }
});
app.use("/", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/calendar", calendarRoutes);
app.use("/dashboard", dashboardRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur", error: err.message });
});

// Connexion à la base de données
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });

// 🚀 Démarrage du serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});