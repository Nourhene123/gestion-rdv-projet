const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log('Headers reçus pour', req.path, ':', req.headers);

  if (!authHeader) {
    console.log("Aucun header Authorization trouvé");
    return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Token absent dans le header Authorization");
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Doit correspondre à "superSecretKey"
    console.log("Token décodé:", decoded);
    req.user = decoded;
    if (!["patient", "doctor"].includes(decoded.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle invalide" });
    }
    next();
  } catch (error) {
    console.log("Erreur de vérification du token:", error.message);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};