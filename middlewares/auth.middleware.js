const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    console.log(" Aucun header Authorization trouvé");
    return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log(" Token absent dans le header Authorization");
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé avec succès :", decoded);

    // Ajouter la vérification du rôle
    req.user = decoded;
    if (!['patient', 'doctor'].includes(decoded.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle invalide" });
    }
    next();
  } catch (error) {
    console.log("Erreur lors de la vérification du token :", error.message);
    res.status(401).json({ message: "Token invalide" });
  }
};
