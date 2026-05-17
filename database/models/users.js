const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'therapist', 'admin'], 
        default: 'user'
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },
    identifier: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);