const staffService = require('../services/staff.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const User = require('../model/user.model');

//List of All Staff
const allStaff = async (req, res) => {
    try {
    const staff = await staffService.staffList();
    res.status(201).json({ message: 'Staff fetched successfully', staff });
} catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Add new staff
const addStaff = async (req, res) => {
  try {
    const staff = await staffService.addStaff(req.body);
    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Edit staff details
const editStaff = async (req, res) => {
  try {
    const updatedStaff = await staffService.editStaff(req.params.staffId, req.body);
    res.status(200).json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await staffService.deleteStaff(req.params.staffId);
    res.status(200).json({ message: 'Staff deleted successfully', staff: deletedStaff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get bookings assigned to staff
const getStaffBookings = catchAsync(async (req, res) => {
    const bookings = await staffService.getStaffBookings(req.params.staffId);
    res.status(200).json({
        status: 'success',
        data: bookings
    });
});

// Get staff by ID
const getStaffById = catchAsync(async (req, res) => {
    const staff = await staffService.getStaffById(req.params.staffId);
    res.status(200).json({
        status: 'success',
        data: staff
    });
});

const getAssignmentStats = catchAsync(async (req, res) => {
    const stats = await User.aggregate([
        { $match: { role: 'staff' } },
        { $project: {
            name: 1,
            bookingCount: { $size: "$assignedBookings" },
            lastAssigned: 1
        }}
    ]);
    res.json(stats);
});

module.exports = { addStaff, editStaff, deleteStaff, getStaffBookings, allStaff, getStaffById, getAssignmentStats };
