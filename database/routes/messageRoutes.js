const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');

// POST - patient sends a contact message
router.post('/', async (req, res) => {
    try {
        const { expert_name, sender_name, message } = req.body;
        if (!expert_name || !sender_name || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const newMessage = new Message({ expert_name, sender_name, message });
        await newMessage.save();
        console.log(`New message for ${expert_name} from ${sender_name}`);
        res.status(201).json({ message: 'Message sent successfully!', data: newMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET - fetch all messages (therapist portal)
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ sent_at: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET - fetch messages for a specific user (user inbox)
// GET /api/messages/inbox?sender=tshepo
router.get('/inbox', async (req, res) => {
    try {
        const { sender } = req.query;
        if (!sender) return res.status(400).json({ message: 'sender query param required.' });
        const messages = await Message.find({
            sender_name: { $regex: new RegExp(`^${sender}$`, 'i') }
        }).sort({ sent_at: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH - mark a message as read
router.patch('/:id/read', async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            { is_read: true },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Message not found.' });
        res.json({ message: 'Marked as read.', data: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST - therapist sends a reply  /api/messages/:id/reply
router.post('/:id/reply', async (req, res) => {
    try {
        const { reply_text, therapist_name } = req.body;
        if (!reply_text) return res.status(400).json({ message: 'reply_text is required.' });

        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    replies: {
                        text:          reply_text,
                        therapist_name: therapist_name || 'Your Therapist',
                        sent_at:       new Date()
                    }
                }
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Message not found.' });
        console.log(`Reply sent by ${therapist_name} on message ${req.params.id}`);
        res.json({ message: 'Reply saved.', data: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE - remove a message
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Message.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Message not found.' });
        res.json({ message: 'Message deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;