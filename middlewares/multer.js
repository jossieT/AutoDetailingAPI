const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Multer upload handler for dynamic folders
const getUploadMiddleware = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: folderName, // Dynamic folder name
            allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file types
        },
    });

    return multer({ storage });
};

module.exports = {
    uploadServiceImages: getUploadMiddleware('services'), // For service images
    uploadBookingImages: getUploadMiddleware('bookings'), // For booking images
    uploadBlogImages: getUploadMiddleware('blogs'), // For blog images
    uploadGalleryImages: getUploadMiddleware('gallery'), // For gallery images
};
