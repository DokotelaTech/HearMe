const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    role: {
        type: String,
        enum: ['user', 'therapist', 'admin'],
        required: true
    },

    /* =========================================
       USER FIELDS
    ========================================= */

    anonymousName: {
        type: String,
        unique: true,
        sparse: true
    },

    struggles: [{
        type: String
    }],

    /* =========================================
       THERAPIST FIELDS
    ========================================= */

    firstName: {
        type: String
    },

    lastName: {
        type: String
    },

    qualification: {
        type: String
    },

    institutionName: {
        type: String
    },

    location: {
        type: String
    },

    specialization: {
        type: String
    },

    /* =========================================
       COMMON FIELDS
    ========================================= */

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);