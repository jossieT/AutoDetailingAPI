const express = require('express');
const serviceController = require('../controller/service.controller');
const { uploadServiceImages } = require('../middlewares/multer');
const validate = require('../middlewares/validate');
const serviceValidation = require('../validations/service.validation');
const { adminAuth, authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Routes for Service
 */

/**
 * @openapi
 * tags:
 *   name: Services
 *   description: API for managing services in the Auto Detailing system
 */

/** POST Methods */
/**
 * @openapi
 * '/api/service':
 *   post:
 *     tags:
 *     - Services
 *     summary: Create a new service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Car Wash
 *               price:
 *                 type: number
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 example: Comprehensive exterior and interior car wash.
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/** GET Methods */
/**
 * @openapi
 * '/api/service':
 *   get:
 *     tags:
 *     - Services
 *     summary: Get all services
 *     responses:
 *       200:
 *         description: List of all services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       500:
 *         description: Server error
 */

/**
 * @openapi
 * '/api/service/{serviceId}':
 *   get:
 *     tags:
 *     - Services
 *     summary: Get a service by ID
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the service
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */

/** PATCH Methods */
/**
 * @openapi
 * '/api/service/{serviceId}':
 *   patch:
 *     tags:
 *     - Services
 *     summary: Update a service by ID
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the service to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Service Name
 *               price:
 *                 type: number
 *                 example: 60.00
 *               description:
 *                 type: string
 *                 example: Updated service description
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */

/** DELETE Methods */
/**
 * @openapi
 * '/api/service/{serviceId}':
 *   delete:
 *     tags:
 *     - Services
 *     summary: Delete a service by ID
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the service to delete
 *     responses:
 *       204:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */


/**
 * @openapi
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 12345
 *         name:
 *           type: string
 *           example: Car Wash
 *         description:
 *           type: string
 *           example: Comprehensive exterior and interior car wash.
 *         pricing:
 *           type: object
 *           properties:
 *             SUV:
 *               type: object
 *               properties:
 *                 basePrice:
 *                   type: number
 *                   example: 70.00
 *                 maxPrice:
 *                   type: number
 *                   example: 120.00
 *             AUTO:
 *               type: object
 *               properties:
 *                 basePrice:
 *                   type: number
 *                   example: 50.00
 *                 maxPrice:
 *                   type: number
 *                   example: 100.00
 *         duration:
 *           type: object
 *           properties:
 *             SUV:
 *               type: number
 *               example: 3
 *             AUTO:
 *               type: number
 *               example: 2
 *         image:
 *           type: string
 *           example: "https://example.com/images/car-wash.jpg"
 *         additionalServices:
 *           type: array
 *           items:
 *             type: string
 *             example: 63e2e8a6c92f8a5a4b3d2e17
 *         features:
 *           type: array
 *           items:
 *             type: string
 *             example: "Includes vacuuming"
 *         available:
 *           type: boolean
 *           default: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-12-08T10:15:30Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-12-08T10:20:30Z
 */




// Create a new service
router.post('/api/service', adminAuth, validate(serviceValidation.createServiceSchema), uploadServiceImages.single('image'), serviceController.createService);

// Get all services
router.get('/api/service', serviceController.getServices);

// Get a specific service by ID
router.get('/api/service/:serviceId', validate(serviceValidation.getServiceSchema), serviceController.getServiceById);

// Update a specific service by ID
router.patch('/api/service/:serviceId', adminAuth, validate(serviceValidation.updateServiceSchema), uploadServiceImages.single('image'), serviceController.updateService);

// Delete a specific service by ID
router.delete('/api/service/:serviceId', adminAuth, validate(serviceValidation.deleteServiceSchema), serviceController.deleteServiceById);

module.exports = router;
