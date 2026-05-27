const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    schedule: [
        {
            day: { type: String },
            start: { type: String },
            end: { type: String },
            active: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);