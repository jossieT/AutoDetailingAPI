const express = require('express');
const addOnController = require('../controller/addon.services.controller');
const router = express.Router();
const validate = require('../middlewares/validate');
const addonValidation = require('../validations/addon.validation');
const { adminAuth } = require('../middlewares/auth');

/**
 * @openapi
 * /api/addons:
 *   post:
 *     summary: Create a new add-on service
 *     tags:
 *       - Add-Ons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddOnService'
 *     responses:
 *       201:
 *         description: Add-on service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddOnService'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get all add-on services
 *     tags:
 *       - Add-Ons
 *     responses:
 *       200:
 *         description: A list of add-on services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AddOnService'
 *       500:
 *         description: Internal server error
 * /api/addons/{id}:
 *   get:
 *     summary: Get a specific add-on service by ID
 *     tags:
 *       - Add-Ons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the add-on service
 *     responses:
 *       200:
 *         description: Add-on service retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddOnService'
 *       404:
 *         description: Add-on service not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a specific add-on service by ID
 *     tags:
 *       - Add-Ons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the add-on service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddOnService'
 *     responses:
 *       200:
 *         description: Add-on service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddOnService'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Add-on service not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a specific add-on service by ID
 *     tags:
 *       - Add-Ons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the add-on service
 *     responses:
 *       204:
 *         description: Add-on service deleted successfully
 *       404:
 *         description: Add-on service not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AddOnService:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "63e2e8a6c92f8a5a4b3d2e22"
 *         optionName:
 *           type: string
 *           description: Name of the add-on option.
 *           example: "Extra Wax Coating"
 *         additionalPrice:
 *           type: object
 *           properties:
 *             minBasePrice:
 *               type: number
 *               description: Minimum base price for the add-on.
 *               example: 10.00
 *             maxPrice:
 *               type: number
 *               description: Maximum price for the add-on.
 *               example: 20.00
 *         features:
 *           type: array
 *           description: List of additional features provided by this add-on.
 *           items:
 *             type: string
 *             example: "Protective wax layer"
 *         description:
 *           type: string
 *           description: Detailed description of the add-on service.
 *           example: "Adds an extra layer of high-quality wax to enhance the car's shine and provide protection."
 *         duration:
 *           type: number
 *           description: Duration of the add-on service in minutes.
 *           example: 30
 *         available:
 *           type: boolean
 *           description: Indicates whether the add-on service is available.
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the add-on was created.
 *           example: "2024-12-18T10:15:30Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the add-on was last updated.
 *           example: "2024-12-18T11:00:00Z"
 */


router.post('/api/addons', adminAuth, validate(addonValidation.createAddOnService), addOnController.createAddOn); // Create an add-on
router.get('/api/addons', addOnController.getAllAddOns); // Get all add-ons
router.get('/api/addons/:id', validate(addonValidation.getAddOnServiceById), addOnController.getAddOnById); // Get a single add-on
router.patch('/api/addons/:id', adminAuth, validate(addonValidation.updateAddOnServiceById), addOnController.updateAddOn); // Update an add-on
router.delete('/api/addons/:id', adminAuth, validate(addonValidation.deleteAddOnServiceById), addOnController.deleteAddOn); // Delete an add-on

module.exports = router;
