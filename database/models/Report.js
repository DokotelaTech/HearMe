// const mongoose = require('mongoose');

// const reportSchema = new mongoose.Schema({

//     // Who submitted
//     therapistId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     therapistName: {
//         type: String,
//         required: true
//     },

//     // What they're reporting
//     category: {
//         type: String,
//         enum: ['technical', 'client', 'safety'],
//         required: true
//     },

//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     // Admin tracking
//     status: {
//         type: String,
//         enum: ['pending', 'reviewed', 'resolved'],
//         default: 'pending'
//     },

//     adminNote: {
//         type: String,
//         trim: true
//     }

// }, { timestamps: true });

// module.exports = mongoose.model('Report', reportSchema);


const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // 1. Reporter Information
    reporterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    reporterName: {
        type: String,
        trim: true
    },
    
    // 2. Report Classification
    type: { 
        type: String, 
        enum: ['clinical', 'moderation'], 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: '',
        trim: true
    },

    // 3. Post-specific fields (Only populated if type === 'moderation')
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post' 
    },
    postContent: { type: String },
    postAuthor: { type: String },

    // 4. Status & Management
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'resolved', 'dismissed', 'deleted'], 
        default: 'pending' 
    },
    adminNote: { 
        type: String, 
        trim: true 
    },
    resolvedAt: { type: Date }

}, { timestamps: true });

// ==========================================
// PERFORMANCE INDEXES
// ==========================================
// Optimizes queries like: "Find all pending moderation reports"
reportSchema.index({ type: 1, status: 1 });


// ==========================================
// PRE-SAVE VALIDATION HOOK
// ==========================================
// reportSchema.pre('save', function(next) {
//     // If this is a moderation report, it absolutely MUST have a postId
//     if (this.type === 'moderation' && !this.postId) {
//         return next(new Error('A postId is strictly required for moderation reports.'));
//     }

//     // If it's a clinical report, we can ensure post-related fields are stripped out 
//     // just in case they were accidentally sent from the frontend
//     if (this.type === 'clinical') {
//         this.postId = undefined;
//         this.postContent = undefined;
//         this.postAuthor = undefined;
//     }

//     next();
// });

module.exports = mongoose.model('Report', reportSchema);
