const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require("../controllers/appointmentController");

router.get("/", authMiddleware, getAppointments);
router.post("/", authMiddleware, createAppointment);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router; 