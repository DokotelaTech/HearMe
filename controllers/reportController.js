const Report = require('../database/models/Report');
const Post = require('../database/models/Post');
const User = require('../database/models/users');

const createReport = async (req, res) => {
    try {
        const { category, description, postId } = req.body;

        if (!category) return res.status(400).json({ message: 'Category is required' });
        if (!postId) return res.status(400).json({ message: 'Post ID is required' });

        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Prevent duplicate reports from same user
        const existing = await Report.findOne({ postId, reporterIdentifier: userIdentifier });
        if (existing) return res.status(400).json({ message: 'You have already reported this post.' });

        const report = new Report({
            postId,
            postContent: post.content,
            postAuthor: post.authorIdentifier,
            reporterIdentifier: userIdentifier,
            category,
            description: description || ''
        });

        await report.save();
        res.status(201).json({ message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const dismissReport = async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' });
        res.json({ message: 'Report dismissed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReportedPost = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        await Post.findByIdAndDelete(report.postId);
        await Report.findByIdAndUpdate(req.params.id, { status: 'deleted' });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getReports, dismissReport, deleteReportedPost };