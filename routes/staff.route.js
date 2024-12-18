const express = require('express');
const staffController = require('../controller/staff.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Get all staff
router.get('/api/staff', staffController.allStaff);
// Add a new staff member
router.post('/api/staff', staffController.addStaff);

// Edit staff details
router.put('/api/staff/:staffId', auth, staffController.editStaff);

// Delete staff
router.delete('/api/staff/:staffId', auth, staffController.deleteStaff);

// Get bookings assigned to staff
router.get('/api/staff/:staffId/bookings', auth, staffController.getStaffBookings);

module.exports = router;
