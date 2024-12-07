const express = require('express');
const galleryController = require('../controller/gallery.controller');

const router = express.Router();

// Create a new gallery entry
router.post('/api/gallery', galleryController.createGalleryEntry);

// Get all gallery entries
router.get('/api/gallery', galleryController.getAllGalleryEntries);

// Get a gallery entry by ID
router.get('/api/gallery:galleryId', galleryController.getGalleryEntryById);

// Update a gallery entry by ID
router.patch('/api/gallery:galleryId', galleryController.updateGalleryEntryById);

// Delete a gallery entry by ID
router.delete('/api/gallery:galleryId', galleryController.deleteGalleryEntryById);

module.exports = router;
