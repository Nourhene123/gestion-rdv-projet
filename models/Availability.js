
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);