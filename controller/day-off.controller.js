const catchAsync = require('../utils/catchAsync');
const dayOffService = require('../services/day-off.service');

// Create a new day off
const createDayOff = catchAsync(async (req, res) => {
    const dayOff = await dayOffService.createDayOff(req.body);
    res.status(201).json({
        status: 'success',
        message: dayOff.isFullDay ? 'Full day marked as off' : 'Time slots marked as off',
        data: dayOff
    });
});

// Get all day offs
const getAllDayOffs = catchAsync(async (req, res) => {
    const dayOffs = await dayOffService.getAllDayOffs();
    res.status(200).json({
        status: 'success',
        data: dayOffs
    });
});

// Delete a day off by date
const deleteDayOff = catchAsync(async (req, res) => {
    const { date } = req.params;
    await dayOffService.deleteDayOff(date);
    res.status(200).json({
        status: 'success',
        message: "Day off deleted successfully and availability restored."
    });
});

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
};
