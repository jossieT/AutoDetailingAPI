const catchAsync = require('../utils/catchAsync');
const dayOffService = require('../services/day-off.service');

// Create a new day off
const createDayOff = catchAsync(async (req, res) => {
    const { date, reason, times } = req.body;
    const dayOff = await dayOffService.createDayOff({ date, reason, times });
    res.status(201).json(dayOff);
});

// Get all day offs
const getAllDayOffs = catchAsync(async (req, res) => {
    const dayOffs = await dayOffService.getAllDayOffs();
    res.status(200).json(dayOffs);
});

// Delete a day off by date
const deleteDayOff = catchAsync(async (req, res) => {
    const { date } = req.params;
    await dayOffService.deleteDayOff(date);
    res.status(200).json({ message: "Day off deleted successfully." });
});

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
};
