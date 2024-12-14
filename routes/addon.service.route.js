const express = require('express');
const addOnController = require('../controller/addon.services.controller');
const router = express.Router();

router.post('/api/addons', addOnController.createAddOn); // Create an add-on
router.get('/api/addons', addOnController.getAllAddOns); // Get all add-ons
router.get('/api/addons/:id', addOnController.getAddOnById); // Get a single add-on
router.put('/api/addons/:id', addOnController.updateAddOn); // Update an add-on
router.delete('/api/addons/:id', addOnController.deleteAddOn); // Delete an add-on

module.exports = router;
