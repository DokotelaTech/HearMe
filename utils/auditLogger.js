const AuditLog = require('../database/models/AuditLog');

function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        return String(forwardedFor).split(',')[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || 'unknown';
}

async function recordAuditLog(req, {
    actor,
    action,
    targetUser,
    targetEmail,
    metadata = {}
}) {
    try {
        await AuditLog.create({
            actorId: actor?._id || actor?.id || req.user?.userId,
            actorRole: actor?.role || req.user?.role || 'system',
            actorEmail: actor?.email,
            action,
            targetUserId: targetUser?._id || targetUser?.id,
            targetEmail: targetEmail || targetUser?.email,
            ip: getClientIp(req),
            userAgent: req.headers['user-agent'] || '',
            metadata
        });
    } catch (error) {
        console.error('Audit log write failed:', error.message);
    }
}

module.exports = { getClientIp, recordAuditLog };
