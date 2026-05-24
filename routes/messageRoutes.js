const express = require("express");

const router = express.Router();

// MIDDLEWARE

const {authMiddleware }=
require("../middleware/authMiddleware");

// CONTROLLERS

const {
    getConversations,
    getConversationMessages,
    sendMessage
} = require("../controllers/messageController");

// ROUTES

router.get(
    "/conversations",
    authMiddleware,
    getConversations
);

router.get(
    "/:id",
    authMiddleware,
    getConversationMessages
);

router.post(
    "/send",
    authMiddleware,
    sendMessage
);

module.exports = router;