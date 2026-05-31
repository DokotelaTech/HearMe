const express = require('express');
const router = express.Router();
const Group = require('../database/models/Group');
const GroupMessage = require('../database/models/GroupMessage');
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');

function ensureRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: `${role} access required.` });
        }

        next();
    };
}

function displayName(user) {
    if (!user) return 'Member';

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) return fullName;

    return user.anonymousName || user.username || user.email;
}

async function findGroupForParticipant(groupId, userId) {
    const group = await Group.findById(groupId);

    if (!group) {
        return null;
    }

    const isTherapist = group.therapistId.toString() === userId;
    const isMember = group.members.some(memberId => memberId.toString() === userId);

    return isTherapist || isMember ? group : null;
}

router.get('/', verifyToken, async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('therapistId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        const data = groups.map(group => {
            const isMember = group.members.some(memberId => memberId.toString() === req.user.userId);
            const isOwner = group.therapistId._id.toString() === req.user.userId;

            return {
                id: group._id,
                name: group.name,
                category: group.category,
                description: group.description,
                meetingTime: group.meetingTime,
                memberCount: group.members.length,
                therapistName: displayName(group.therapistId),
                events: group.events || [],
                isMember,
                isOwner
            };
        });

        res.status(200).json({ groups: data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/mine', verifyToken, ensureRole('therapist'), async (req, res) => {
    try {
        const groups = await Group.find({ therapistId: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({ groups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, ensureRole('therapist'), async (req, res) => {
    try {
        const { name, category, description, meetingTime } = req.body;

        const group = new Group({
            therapistId: req.user.userId,
            name,
            category,
            description,
            meetingTime
        });

        await group.save();
        res.status(201).json({ message: 'Group created successfully.', group });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/join', verifyToken, ensureRole('user'), async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found.' });

        const alreadyJoined = group.members.some(memberId => memberId.toString() === req.user.userId);

        if (!alreadyJoined) {
            group.members.push(req.user.userId);
            await group.save();
        }

        res.status(200).json({ message: 'Joined group successfully.', groupId: group._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/members', verifyToken, ensureRole('therapist'), async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            therapistId: req.user.userId
        }).populate('members', 'username anonymousName email createdAt');

        if (!group) return res.status(404).json({ message: 'Group not found.' });

        res.status(200).json({
            members: group.members.map(member => ({
                id: member._id,
                name: displayName(member),
                email: member.email,
                joinedLabel: member.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id/members/:userId', verifyToken, ensureRole('therapist'), async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            therapistId: req.user.userId
        });

        if (!group) return res.status(404).json({ message: 'Group not found.' });

        group.members = group.members.filter(memberId => memberId.toString() !== req.params.userId);
        await group.save();

        res.status(200).json({ message: 'User removed from group.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/events', verifyToken, ensureRole('therapist'), async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            therapistId: req.user.userId
        });

        if (!group) return res.status(404).json({ message: 'Group not found.' });

        const { title, date, time, notes } = req.body;
        group.events.push({ title, date, time, notes });
        await group.save();

        res.status(201).json({
            message: 'Group event scheduled.',
            events: group.events
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/messages', verifyToken, async (req, res) => {
    try {
        const group = await findGroupForParticipant(req.params.id, req.user.userId);
        if (!group) return res.status(403).json({ message: 'Join this group before viewing chat.' });

        const messages = await GroupMessage.find({ groupId: group._id })
            .sort({ createdAt: 1 })
            .limit(100);

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/messages', verifyToken, async (req, res) => {
    try {
        const group = await findGroupForParticipant(req.params.id, req.user.userId);
        if (!group) return res.status(403).json({ message: 'Join this group before chatting.' });

        const user = await User.findById(req.user.userId);
        const message = new GroupMessage({
            groupId: group._id,
            senderId: req.user.userId,
            senderRole: req.user.role,
            senderName: displayName(user),
            message: req.body.message
        });

        await message.save();
        res.status(201).json({ message: 'Message sent.', data: message });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
