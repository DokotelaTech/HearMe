const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

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


module.exports = mongoose.model('User', userSchema);