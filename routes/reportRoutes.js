const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
    createReport,
    getReports
} = require("../controllers/reportController");

router.get("/", authMiddleware, getReports);
router.post("/", authMiddleware, createReport);

<<<<<<< HEAD
module.exports = router; 
=======
module.exports = router; 
>>>>>>> 98ea0a3 (sprint 2)
