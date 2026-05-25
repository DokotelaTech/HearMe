const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// ==========================================
// APPOINTMENTS LOGIC
// ==========================================

// GET all appointments (Matches fetch from portal.js: GET /api/appointments)
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: 1, start_time: 1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new appointment (Matches fetch from portal.js: POST /api/appointments)
router.post('/appointments', async (req, res) => {
    try {
        console.log("Appointment POST route hit! Saving new booking..."); // Added for debugging
        const appointment = new Appointment({
            client_id: req.body.client_id,
            start_time: req.body.start_time,
            duration_mins: req.body.duration_mins,
            status: req.body.status || 'CONFIRMED',
            session_notes: req.body.session_notes || '',
            date: req.body.date || Date.now()
        });

        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        console.error("Error booking appointment:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE an appointment (Matches fetch from portal.js: DELETE /api/appointments/:id)
router.delete('/appointments/:id', async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        
        if (!deletedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        res.json({ message: "Successfully deleted appointment" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ==========================================
// AVAILABILITY LOGIC
// ==========================================

// GET weekly availability (Matches fetch from portal.js: GET /api/availability)
router.get('/availability', async (req, res) => {
    try {
        console.log("Availability route hit! Sending data to frontend..."); // Added for debugging
        const availability = await Availability.find();
        res.json(availability);
    } catch (err) {
        console.error("Error fetching availability:", err);
        res.status(500).json({ message: err.message });
    }
});

// POST batch update availability (Matches fetch from portal.js batch save)
router.post('/availability', async (req, res) => {
    try {
        const { availability } = req.body; // Array of availability objects from frontend
        
        if (!availability || !Array.isArray(availability)) {
            return res.status(400).json({ message: "Invalid data format." });
        }

        // Clear existing availability and insert the newly checked days
        await Availability.deleteMany({});
        
        if (availability.length > 0) {
            // Ensure is_active is set to true for checked items
            const newRecords = availability.map(item => ({
                ...item,
                is_active: true 
            }));
            await Availability.insertMany(newRecords);
        }

        res.status(200).json({ message: "Availability successfully updated!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;