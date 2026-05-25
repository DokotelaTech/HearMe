const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    day_of_week: { type: String, required: true }, // e.g. "Monday"
    start_time:  { type: String, default: '09:00 AM' },
    end_time:    { type: String, default: '05:00 PM' },
    is_active:   { type: Boolean, default: true }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);