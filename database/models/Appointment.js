const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapistName: { type: String },
    clientName:    { type: String },
    date:          { type: String, required: true },
    time:          { type: String, required: true },
    type:          { type: String, enum: ['online', 'in-person'], default: 'online' },
    note:          { type: String },
    isEmergency:   { type: Boolean, default: false },
    emergencyGroupId: { type: String, index: true },
    emergencyAcceptedAt: { type: Date },
    
    status: {
        type: String,
        enum: ['pending_payment', 'pending', 'approved', 'denied', 'cancelled', 'completed', 'accepted_by_other'],
        default: 'pending_payment'
    },
    reminder10Sent: {
        user: { type: Boolean, default: false },
        therapist: { type: Boolean, default: false }
    },
    dailyRoomUrl:  { type: String },
    dailyRoomName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
