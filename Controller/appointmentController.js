const Appointment = require("../models/Appointment");

const { getNotificationSystem } = require("../notificationSystem");

// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { appointmentDate, notes, doctorId } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié." });
    }
    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.user.userId,
      date: new Date(appointmentDate),
      notes: notes || "",
      status: "En attente",
    });

    const savedAppointment = await newAppointment.save();

    // Get the notification system instance here, after server initialization
    const notificationSystem = getNotificationSystem();
    notificationSystem.notifyDoctor(doctorId, savedAppointment);

    res.status(201).json({
      success: true,
      message: "Rendez-vous réservé avec succès.",
      data: savedAppointment,
    });
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous :", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// Get All Appointments
exports.getAllAppointments = (req, res) => {
  Appointment.find()
    .populate({
      path: "doctor",
      match: { role: "doctor" },
    })
    .populate({
      path: "patient",
      match: { role: "patient" },
    })
    .then((appointments) => {
      console.log("Rendez-vous avant filtrage :", appointments);
      const filteredAppointments = appointments.filter((appointment) => {
        console.log("Doctor pour ce rendez-vous :", appointment.doctor);
        console.log("Patient pour ce rendez-vous :", appointment.patient);
        return appointment.doctor && appointment.patient;
      });
      console.log("Rendez-vous après filtrage :", filteredAppointments);
      return res.status(200).json({ appointments: filteredAppointments });
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des rendez-vous :", err);
      return res.status(500).json({ success: false, message: "Error retrieving appointments" });
    });
};

// Update Appointment Status
exports.updateAppointmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  Appointment.findById(id)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      appointment.status = status;
      return appointment.save();
    })
    .then((updatedAppointment) => {
      return res.status(200).json({
        success: true,
        message: "Appointment status updated successfully!",
        appointment: updatedAppointment,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ success: false, message: "Error updating appointment" });
    });
};

// Get Calendar
exports.getCalendar = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }
    if (req.user.role === "patient") {
      const appointments = await Appointment.find({ patient: req.user.userId })
        .populate("doctor", "nom specialite")
        .sort({ date: 1 });

      res.render("calendar", { appointments: appointments || [] });
      console.log("appointments", appointments);
    } else if (req.user.role === "doctor") {
      const appointments = await Appointment.find({ doctor: req.user.userId })
        .populate("patient", "nom")
        .sort({ date: 1 });

      res.render("calendar", { appointments: appointments || [] });
      console.log("appointments", appointments);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
};