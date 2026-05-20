const mongoose = require('mongoose');
<<<<<<< HEAD
<<<<<<< HEAD
const bcrypt = require('bcrypt'); 

const userSchema = new mongoose.Schema({

    // =========================================
    //    ROLE
    role: {
        type: String,
        enum: ['user', 'therapist','admin'],
        required: true
    },

    // =========================================
    //    USER FIELDS
    
    username: { type: String, trim: true },
    anonymousName: { type: String, unique: true, sparse: true },
    userPhone: { type: String, trim: true },
    race: {
        type: String,
        enum: ['African', 'Coloured', 'Indian', 'White', 'Other']
    },
    struggles: [{ type: String }],

    // =========================================
    //    THERAPIST FIELDS
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    qualification: { type: String, trim: true },
    licenseNumber: { type: String, trim: true, unique: true, sparse: true },
    institutionName: { type: String, trim: true },
    specialization: { type: String, trim: true },
    location: { type: String, trim: true },

    // profile details
    bio: { type: String, trim: true },
    approach: { type: String, trim: true },
    sessionPrice: { type: Number },
    sessionDuration: { type: Number },
    sessionEnvironment: { type: String, trim: true },
    profileStatus: {
        type: String,
        enum: ['incomplete', 'verifying', 'verified'],
        default: 'incomplete'
    },
    profileImage: { type: String },
    credentialDocument: { type: String },  // ✅ comma here — this was the bug

    // =========================================
    //    COMMON FIELDS
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    }

}, {
    timestamps: true
});

// =========================================
//    CONDITIONAL VALIDATION 

userSchema.pre('validate', function() {
    if (this.role === 'user') {
        if (!this.username) {
            throw new Error('Username is required'); 
        }
    }

    if (this.role === 'therapist') {
        if (!this.firstName) throw new Error('First name is required');
        if (!this.lastName) throw new Error('Last name is required');
        if (!this.phone) throw new Error('Phone number is required');
        if (!this.qualification) throw new Error('Qualification is required');
        if (!this.licenseNumber) throw new Error('License number is required');
        if (!this.specialization) throw new Error('Specialization is required');
    }
});

// =========================================
//    PASSWORD HASHING 

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return; 

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// =========================================
//    PASSWORD COMPARISON METHOD
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
=======
=======
const bcrypt = require('bcrypt'); 
>>>>>>> e9da0a9 (therapists)

const userSchema = new mongoose.Schema({

    //  =========================================
    //    ROLE
    role: {
        type: String,
        enum: ['user', 'therapist'],
        required: true
    },

    // =========================================
    //    USER FIELDS
    username: { type: String, trim: true },
    anonymousName: { type: String, unique: true, sparse: true },
    userPhone: { type: String, trim: true },
    race: {
        type: String,
        enum: ['African', 'Coloured', 'Indian', 'White', 'Other']
    },
    struggles: [{ type: String }],

    // =========================================
    //    THERAPIST FIELDS
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    qualification: { type: String, trim: true },
    licenseNumber: { type: String, trim: true, unique: true, sparse: true },
    institutionName: { type: String, trim: true },
    specialization: { type: String, trim: true },
    location: { type: String, trim: true },

    // =========================================
    //    COMMON FIELDS
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    }
<<<<<<< HEAD
}, { timestamps: true }); 
>>>>>>> 8bfd832 (project)
=======

}, {
    timestamps: true
});

// =========================================
//    CONDITIONAL VALIDATION 

userSchema.pre('validate', function() {
    /* USER VALIDATION */
    if (this.role === 'user') {
        if (!this.username) {
            throw new Error('Username is required'); 
        }
    }

    /* THERAPIST VALIDATION */
    if (this.role === 'therapist') {
        if (!this.firstName) throw new Error('First name is required');
        if (!this.lastName) throw new Error('Last name is required');
        if (!this.phone) throw new Error('Phone number is required');
        if (!this.qualification) throw new Error('Qualification is required');
        if (!this.licenseNumber) throw new Error('License number is required');
        if (!this.specialization) throw new Error('Specialization is required');
    }
});

// =========================================
//    PASSWORD HASHING 

userSchema.pre('save', async function() {
    // Only hash the password 
    if (!this.isModified('password')) {
        return; 
    }

    // ✅ Generate salt and hash directly 
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});

// =========================================
//    PASSWORD COMPARISON METHOD
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

>>>>>>> e9da0a9 (therapists)

module.exports = mongoose.model('User', userSchema);