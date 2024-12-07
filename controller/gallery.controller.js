const galleryService = require('../services/gallery.service');
const catchAsync = require('../utils/catchAsync');

// Create a new gallery entry
const createGalleryEntry = catchAsync(async (req, res) => {
    const galleryEntry = await galleryService.createGalleryEntry(req.body);
    res.status(201).json(galleryEntry);
});

// Get all gallery entries
const getAllGalleryEntries = catchAsync(async (req, res) => {
    const galleryEntries = await galleryService.getAllGalleryEntries();
    res.status(200).json(galleryEntries);
});

// Get a gallery entry by ID
const getGalleryEntryById = catchAsync(async (req, res) => {
    const galleryEntry = await galleryService.getGalleryEntryById(req.params.galleryId);
    res.status(200).json(galleryEntry);
});

// Update a gallery entry by ID
const updateGalleryEntryById = catchAsync(async (req, res) => {
    const updatedGalleryEntry = await galleryService.updateGalleryEntryById(req.params.galleryId, req.body);
    res.status(200).json(updatedGalleryEntry);
});

// Delete a gallery entry by ID
const deleteGalleryEntryById = catchAsync(async (req, res) => {
    await galleryService.deleteGalleryEntryById(req.params.galleryId);
    res.status(204).send();
});

module.exports = {
    createGalleryEntry,
    getAllGalleryEntries,
    getGalleryEntryById,
    updateGalleryEntryById,
    deleteGalleryEntryById,
};
