const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../database/models/users');
const Message = require('../database/models/Message');
const { verifyToken } = require('../middleware/authMiddleware');

// =========================================
// HELPERS
// =========================================
function isTherapistMessage(msg) {
    return msg.senderRole === 'therapist';
}

function isUserMessage(msg) {
    return !msg.senderRole || msg.senderRole === 'user';
}

function getThreadClientId(msg, therapistId) {
    if (msg.clientId) return msg.clientId.toString();
    if (msg.senderRole === 'therapist') return null;
    if (msg.senderId.toString() === therapistId.toString()) return null;
    return msg.senderId.toString();
}

function sendDbError(res, error, context) {
    console.error(`Error in ${context}:`, error);
    return res.status(500).json({ message: `Server error: ${context}` });
}

async function saveTherapistReply(therapist, clientId, content) {
    const client = await User.findOne({ _id: clientId, role: 'user' });
    if (!client) return { status: 404, body: { message: 'Client not found.' } };

    const message = new Message({
        therapistId: therapist._id,
        clientId: client._id,
        senderId: therapist._id,
        senderRole: 'therapist',
        senderIdentifier: `${therapist.firstName} ${therapist.lastName}`,
        content: content.trim(),
        read: false
    });

    await message.save();
    return { status: 201, body: { message: 'Reply sent successfully.', data: message } };
}

// =========================================
// POST /api/messages
// Send message (User -> Therapist) or Therapist reply
// =========================================
router.post('/', verifyToken, async (req, res) => {
    try {
        const { therapistId, clientId, content } = req.body;
        const trimmedContent = content?.trim();

        if (!trimmedContent) {
            return res.status(400).json({ message: 'Message content is required.' });
        }

        const account = await User.findById(req.user.userId);
        if (!account) {
            return res.status(401).json({ message: 'Account not found. Please sign in again.' });
        }

        // Therapist replying to user
        if (clientId) {
            if (account.role !== 'therapist') {
                return res.status(403).json({ message: 'Only therapists can reply with a clientId.' });
            }
            if (!mongoose.Types.ObjectId.isValid(clientId)) {
                return res.status(400).json({ message: 'Invalid client id.' });
            }
            const result = await saveTherapistReply(account, clientId, trimmedContent);
            return res.status(result.status).json(result.body);
        }

        // User messaging therapist
        if (account.role !== 'user') {
            return res.status(403).json({ message: 'Sign in as a user to message therapists.' });
        }
        if (!therapistId) {
            return res.status(400).json({ message: 'therapistId is required.' });
        }
        if (!mongoose.Types.ObjectId.isValid(therapistId)) {
            return res.status(400).json({ message: 'Invalid therapist id.' });
        }

        const therapist = await User.findOne({ _id: therapistId, role: 'therapist' });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found.' });
        }

        const message = new Message({
            therapistId: therapist._id,
            clientId: account._id,
            senderId: account._id,
            senderRole: 'user',
            senderIdentifier: account.anonymousName || account.username || account.email,
            content: trimmedContent
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully.', data: message });

    } catch (error) {
        return sendDbError(res, error, 'send message');
    }
});

// =========================================
// POST /api/messages/reply
// Therapist reply alias
// =========================================
router.post('/reply', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Only therapists can send replies.' });
        }

        const { clientId, content } = req.body;
        if (!clientId || !content?.trim()) {
            return res.status(400).json({ message: 'Client and message content are required.' });
        }

        const therapist = await User.findById(req.user.userId);
        const result = await saveTherapistReply(therapist, clientId, content);
        res.status(result.status).json(result.body);

    } catch (error) {
        return sendDbError(res, error, 'send reply');
    }
});

// =========================================
// GET /api/messages/user-inbox
// User's conversations with therapists
// =========================================
router.get('/user-inbox', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can view this inbox.' });
        }

        const userId = req.user.userId;
        const messages = await Message.find({
            $or: [
                { clientId: userId },
                { senderId: userId, therapistId: { $exists: true } }
            ]
        }).sort({ createdAt: -1 });

        const conversationsMap = new Map();

        for (const msg of messages) {
            const therapistKey = msg.therapistId?.toString();
            if (!therapistKey) continue;

            if (!conversationsMap.has(therapistKey)) {
                const therapist = await User.findById(msg.therapistId);
                conversationsMap.set(therapistKey, {
                    therapistId: therapistKey,
                    therapistName: therapist
                        ? `${therapist.firstName} ${therapist.lastName}`
                        : 'Therapist',
                    unreadCount: 0,
                    messages: []
                });
            }

            const conversation = conversationsMap.get(therapistKey);
            conversation.messages.push(msg);
            if (isTherapistMessage(msg) && !msg.read) {
                conversation.unreadCount += 1;
            }
        }

        const conversations = Array.from(conversationsMap.values()).map(conv => {
            conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            conv.lastMessage = conv.messages[conv.messages.length - 1];
            return conv;
        });

        conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

        res.status(200).json({
            unreadTotal: messages.filter(msg => isTherapistMessage(msg) && !msg.read).length,
            conversations
        });

    } catch (error) {
        return sendDbError(res, error, 'fetch user inbox');
    }
});

// =========================================
// PATCH /api/messages/user-read
// Mark therapist messages as read (user side)
// =========================================
router.patch('/user-read', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can mark these messages as read.' });
        }

        const { therapistId } = req.body;
        if (!therapistId) {
            return res.status(400).json({ message: 'therapistId is required.' });
        }

        await Message.updateMany(
            { clientId: req.user.userId, therapistId, senderRole: 'therapist', read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: 'Messages marked as read.' });

    } catch (error) {
        return sendDbError(res, error, 'mark user messages read');
    }
});

// =========================================
// GET /api/messages/inbox
// Therapist inbox
// =========================================
router.get('/inbox', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Only therapists can view this inbox.' });
        }

        const therapistId = req.user.userId;
        const messages = await Message.find({ therapistId }).sort({ createdAt: -1 });
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const key = getThreadClientId(msg, therapistId);
            if (!key) return;

            if (!conversationsMap.has(key)) {
                const clientIdentifier = isUserMessage(msg)
                    ? msg.senderIdentifier
                    : messages.find(e => getThreadClientId(e, therapistId) === key && isUserMessage(e))?.senderIdentifier || 'Client';

                conversationsMap.set(key, {
                    clientId: key,
                    senderIdentifier: clientIdentifier,
                    unreadCount: 0,
                    messages: []
                });
            }

            const conversation = conversationsMap.get(key);
            conversation.messages.push(msg);
            if (isUserMessage(msg) && !msg.read) conversation.unreadCount += 1;
        });

        const conversations = Array.from(conversationsMap.values()).map(conv => {
            const userMsg = conv.messages.find(msg => isUserMessage(msg));
            if (userMsg) conv.senderIdentifier = userMsg.senderIdentifier;

            conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            conv.lastMessage = conv.messages[conv.messages.length - 1];
            return conv;
        });

        conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

        res.status(200).json({
            unreadTotal: messages.filter(msg => isUserMessage(msg) && !msg.read).length,
            conversations
        });

    } catch (error) {
        return sendDbError(res, error, 'fetch inbox');
    }
});

// =========================================
// PATCH /api/messages/read
// Mark messages as read (therapist side)
// =========================================
router.patch('/read', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Only therapists can mark messages as read.' });
        }

        const { senderId } = req.body;
        if (!senderId) {
            return res.status(400).json({ message: 'senderId is required.' });
        }

        await Message.updateMany(
            {
                therapistId: req.user.userId,
                clientId: senderId,
                read: false,
                $or: [{ senderRole: 'user' }, { senderRole: { $exists: false } }]
            },
            { $set: { read: true } }
        );

        res.status(200).json({ message: 'Messages marked as read.' });

    } catch (error) {
        return sendDbError(res, error, 'mark messages read');
    }
});

module.exports = router;