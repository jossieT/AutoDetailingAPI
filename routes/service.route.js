const express = require('express');
const serviceController = require('../controller/service.controller');

const router = express.Router();

/**
 * Routes for Service
 */
// Create a new service
router.post('/api/service', serviceController.createService);

// Get all services
router.get('/api/service', serviceController.getServices);

// Get a specific service by ID
router.get('/api/service/:serviceId', serviceController.getServiceById);

// Update a specific service by ID
router.patch('/api/service/:serviceId', serviceController.updateServiceById);

// Delete a specific service by ID
router.delete('/api/service/:serviceId', serviceController.deleteServiceById);

module.exports = router;
