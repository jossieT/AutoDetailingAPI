const express = require('express');
const dayOffController = require('../controllers/day-off.controller');
const router = express.Router();

// Create a new day off
router.post('/api/day-offs', dayOffController.createDayOff);

// Get all day offs
router.get('/api/day-offs', dayOffController.getAllDayOffs);

// Delete a day off by date
router.delete('/api/day-offs/:date', dayOffController.deleteDayOff);

module.exports = router;
