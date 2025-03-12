const Appointment = require('../models/Appointment');

// Create Appointment
exports.createAppointment = (req, res) => {
  const { doctor, patient, date, status, notes } = req.body;

  const newAppointment = new Appointment({
    doctor,
    patient,
    date,
    status,
    notes
  });

  newAppointment.save()
    .then(appointment => {
      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully!',
        appointment
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error creating appointment' });
    });
};

// Get All Appointments
exports.getAllAppointments = (req, res) => {
  Appointment.find()
    .populate({
      path: 'doctor',
      match: { role: 'doctor' }
    })
    .populate({
      path: 'patient',
      match: { role: 'patient' }
    })
    .then(appointments => {
      console.log("Rendez-vous avant filtrage :", appointments);
      const filteredAppointments = appointments.filter(appointment => {
        console.log("Doctor pour ce rendez-vous :", appointment.doctor);
        console.log("Patient pour ce rendez-vous :", appointment.patient);
        return appointment.doctor && appointment.patient;
      });
      console.log("Rendez-vous après filtrage :", filteredAppointments);
      return res.status(200).json({ appointments: filteredAppointments });
    })
    .catch(err => {
      console.error("Erreur lors de la récupération des rendez-vous :", err);
      return res.status(500).json({ success: false, message: 'Error retrieving appointments' });
    });
};

// Update Appointment Status
exports.updateAppointmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  Appointment.findById(id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      appointment.status = status;
      return appointment.save();
    })
    .then(updatedAppointment => {
      return res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully!',
        appointment: updatedAppointment
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error updating appointment' });
    });
};