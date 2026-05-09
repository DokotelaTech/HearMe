const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    duration: {
        type: String,
        default: "50 min"
    },

    status: {
        type: String,
        default: "CONFIRMED"
    }
});

module.exports = mongoose.model("Appointment", appointmentSchema);