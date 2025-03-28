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

// Update a day off
const updateDayOff = catchAsync(async (req, res) => {
    const { dayOffId } = req.params;
    const updateData = {
        ...req.body,
        // If timeRange is provided in separate fields, combine them
        ...(req.body.startTime && req.body.endTime && {
            timeRange: {
                startTime: req.body.startTime,
                endTime: req.body.endTime
            }
        })
    };

    // Remove individual time fields if they were combined into timeRange
    if (updateData.timeRange) {
        delete updateData.startTime;
        delete updateData.endTime;
    }

    const updatedDayOff = await dayOffService.updateDayOff(dayOffId, updateData);
    
    res.status(200).json({
        status: 'success',
        message: 'Day off updated successfully',
        data: updatedDayOff
    });
});

// Delete a day off
const deleteDayOff = catchAsync(async (req, res) => {
    const { date } = req.params;
    await dayOffService.deleteDayOff(date);
    res.status(200).json({
        status: 'success',
        message: "Day off deleted successfully and availability restored."
    });
});

const getDayOffsByDate = catchAsync(async (req, res) => {
    const dayOffs = await dayOffService.getDayOffsByDate(req.params.date);
    res.status(200).json({
        status: 'success',
        data: dayOffs,
    });
});

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
    updateDayOff,
    getDayOffsByDate
};
