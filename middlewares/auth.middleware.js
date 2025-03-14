// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.accessToken; 
    console.log(req.body)

    if (!token) {
        console.log('Aucun token trouvé dans les cookies');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token décodé:', decoded);
        req.user = decoded;
        if (!['patient', 'doctor'].includes(decoded.role)) {
            return res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log('Erreur de vérification du token:', error.message);
        return res.redirect('/login');
    }
};