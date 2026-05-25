const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    client_id: { type: String, required: true },
    start_time: { type: String, required: true }, // e.g., "09:00"
    duration_mins: { type: Number, required: true, default: 50 },
    status: { type: String, enum: ['CONFIRMED', 'PENDING', 'CANCELLED'], default: 'CONFIRMED' },
    session_notes: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);