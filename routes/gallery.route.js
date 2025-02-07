const express = require('express');
const galleryController = require('../controller/gallery.controller');
const validate = require('../middlewares/validate');
const galleryValidation = require('../validations/gallery.validation');
const { authenticate, adminAuth } = require('../middlewares/auth');
const { uploadGalleryImages } = require('../middlewares/multer');
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Gallery
 *   description: Gallery management APIs
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Gallery:
 *       type: object
 *       required:
 *         - imageUrl
 *       properties:
 *         imageUrl:
 *           type: string
 *           description: URL of the gallery image
 *         description:
 *           type: object
 *           properties:
 *             en:
 *               type: string
 *               description: English description
 *             am:
 *               type: string
 *               description: Amharic description
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/gallery:
 *   post:
 *     summary: Create a new gallery entry
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               description_en:
 *                 type: string
 *               description_am:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gallery entry created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 *   
 *   get:
 *     summary: Get all gallery entries
 *     tags: [Gallery]
 *     responses:
 *       200:
 *         description: List of gallery entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gallery'
 * 
 * /api/gallery/{galleryId}:
 *   get:
 *     summary: Get a gallery entry by ID
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gallery entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Gallery entry not found
 *   
 *   patch:
 *     summary: Update a gallery entry
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               description_en:
 *                 type: string
 *               description_am:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gallery entry updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Gallery entry not found
 *   
 *   delete:
 *     summary: Delete a gallery entry
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Gallery entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Gallery entry not found
 */

// Create a new gallery entry (admin only)
router.post('/api/gallery', 
    uploadGalleryImages.single('image'),
    //validate(galleryValidation.createGallerySchema), 
    galleryController.createGalleryEntry
);

// Get all gallery entries (public)
router.get('/api/gallery', 
    validate(galleryValidation.getGallerySchema), 
    galleryController.getAllGalleryEntries
);

// Get a gallery entry by ID (public)
router.get('/api/gallery/:galleryId', 
    validate(galleryValidation.getGallerySchema), 
    galleryController.getGalleryEntryById
);

// Update a gallery entry by ID (admin only)
router.patch('/api/gallery/:galleryId', 
    authenticate, 
    adminAuth,
    uploadGalleryImages.single('image'),
    validate(galleryValidation.updateGallerySchema), 
    galleryController.updateGalleryEntryById
);

// Delete a gallery entry by ID (admin only)
router.delete('/api/gallery/:galleryId', 
    authenticate, 
    adminAuth,
    validate(galleryValidation.deleteGallerySchema), 
    galleryController.deleteGalleryEntryById
);

module.exports = router;
