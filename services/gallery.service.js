const Gallery = require('../model/gallery.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

// Create a new gallery entry
const createGalleryEntry = async (galleryData) => {
    return await Gallery.create(galleryData);
};

// Get all gallery entries
const getAllGalleryEntries = async () => {
    return await Gallery.find({});
};

// Get a gallery entry by ID
const getGalleryEntryById = async (galleryId) => {
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Gallery entry not found');
    }
    return gallery;
};

// Update a gallery entry by ID
const updateGalleryEntryById = async (galleryId, updateData) => {
    const gallery = await Gallery.findByIdAndUpdate(galleryId, updateData, { new: true });
    if (!gallery) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Gallery entry not found');
    }
    return gallery;
};

// Delete a gallery entry by ID
const deleteGalleryEntryById = async (galleryId) => {
    const gallery = await Gallery.findByIdAndDelete(galleryId);
    if (!gallery) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Gallery entry not found');
    }
    return gallery;
};

module.exports = {
    createGalleryEntry,
    getAllGalleryEntries,
    getGalleryEntryById,
    updateGalleryEntryById,
    deleteGalleryEntryById,
};
