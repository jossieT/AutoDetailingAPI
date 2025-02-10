const galleryService = require('../services/gallery.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');

// Create a new gallery entry
const createGalleryEntry = catchAsync(async (req, res) => {
    // Handle image upload
    let uploadedImage = null;
    if (req.file) {
        uploadedImage = req.file.path; // Cloudinary URL is in file.path
        req.body.image = uploadedImage;
    } else {
        return res.status(httpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'Image is required'
        });
    }

    const galleryEntry = await galleryService.createGalleryEntry(req.body);
    res.status(httpStatus.CREATED).json({
        status: 'success',
        data: galleryEntry
    });
});

// Get all gallery entries
const getAllGalleryEntries = catchAsync(async (req, res) => {
    const galleryEntries = await galleryService.getAllGalleryEntries();
    res.status(httpStatus.OK).json({
        status: 'success',
        data: galleryEntries
    });
});

// Get a gallery entry by ID
const getGalleryEntryById = catchAsync(async (req, res) => {
    const galleryEntry = await galleryService.getGalleryEntryById(req.params.galleryId);
    res.status(httpStatus.OK).json({
        status: 'success',
        data: galleryEntry
    });
});

// Update a gallery entry by ID
const updateGalleryEntryById = catchAsync(async (req, res) => {
    // Handle image upload for updates
    if (req.file) {
        req.body.imageUrl = req.file.path;
    } else if (!req.body.image) {
        // Keep existing image if no new image is provided
        const existingGallery = await galleryService.getGalleryEntryById(req.params.galleryId);
        if (existingGallery) {
            req.body.image = existingGallery.imageUrl;
        }
    }

    const updatedGalleryEntry = await galleryService.updateGalleryEntryById(
        req.params.galleryId, 
        req.body
    );

    res.status(httpStatus.OK).json({
        status: 'success',
        data: updatedGalleryEntry
    });
});

// Delete a gallery entry by ID
const deleteGalleryEntryById = catchAsync(async (req, res) => {
    await galleryService.deleteGalleryEntryById(req.params.galleryId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createGalleryEntry,
    getAllGalleryEntries,
    getGalleryEntryById,
    updateGalleryEntryById,
    deleteGalleryEntryById,
};
