const Doctor = require('../models/doctor');
const Appointment = require('../models/Appointment');
exports.getDoctorDashboard = async (req, res) => {
    try {
        //const doctors = await Doctor.find();
        //console.log(token)
        const appointments = await Appointment.find({ doctor: req.user.userId })
                .populate("patient", "nom email telephone adresse") // Charger les infos du patient
                .sort("date");
                console.log('Rendez-vous:', appointments);
                
                res.render("dashboardDoctor", { doctor: req.user, appointments });
      } catch (error) {
        console.error("Erreur lors de la récupération des docteurs :", error);
        res.status(500).send("Erreur serveur");
      }
    
}
