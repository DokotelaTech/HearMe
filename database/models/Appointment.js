const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapistName: { type: String },
    userName: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['online', 'in-person'], default: 'online' },
    note: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'completed'],
        default: 'pending'
    },
    dailyRoomUrl: { type: String },
    dailyRoomName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);