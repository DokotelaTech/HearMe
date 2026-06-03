const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actorRole: {
        type: String,
        enum: ['user', 'therapist', 'admin', 'system'],
        default: 'system'
    },
    actorEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    ip: {
        type: String,
        default: 'unknown'
    },
    userAgent: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorRole: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
