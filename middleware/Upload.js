const cloudinary = require('cloudinary');
const  CloudinaryStorage  = require('multer-storage-cloudinary');
const multer = require('multer');

// =========================================
//    CLOUDINARY CONFIG
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// =========================================
//    CLOUDINARY STORAGE CONFIGS
const profileImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,  // pass root object
    params: {
        folder: 'hearme/profile-images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
    }
});

const credentialStorage = new CloudinaryStorage({
    cloudinary: cloudinary,  // pass root object
    params: {
        folder: 'hearme/credentials',
        allowed_formats: ['pdf','img'],
        resource_type: 'raw'
    }
});

// =========================================
//    FILE TYPE FILTERS
const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG and PNG images are allowed'), false);
    }
};

const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// =========================================
//    MULTER UPLOAD INSTANCES
const uploadProfileImage = multer({
    storage: profileImageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }   // 5MB max
});

const uploadCredential = multer({
    storage: credentialStorage,
    fileFilter: pdfFilter,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10MB max
});

// module.exports =  {uploadProfileImage, uploadCredential};