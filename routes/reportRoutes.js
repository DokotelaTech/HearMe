const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
    createReport,
    getReports
} = require("../controllers/reportController");

router.get("/", authMiddleware, getReports);
router.post("/", authMiddleware, createReport);

module.exports = router; 