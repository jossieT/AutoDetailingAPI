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
    const dayOffs = await dayOffService.getAllDayOffs(req.query);
    res.status(200).json({
        status: 'success',
        count: dayOffs.length,
        data: dayOffs
    });
});

// Update a day off
const updateDayOff = catchAsync(async (req, res) => {
    const updatedDayOff = await dayOffService.updateDayOff(
        req.params.dayOffId,
        req.body
    );
    
    res.status(200).json({
        status: 'success',
        data: updatedDayOff,
        message: 'Day off updated successfully'
    });
});

// Delete a day off
const deleteDayOff = catchAsync(async (req, res) => {
    await dayOffService.deleteDayOff(req.params.dayOffId);
    res.status(200).json({
        status: 'success',
        message: 'Day off deleted successfully and availability restored'
    });
});

const getDayOffsByDate = catchAsync(async (req, res) => {
    const dayOffs = await dayOffService.getDayOffsByDate(req.params.date);
    res.status(200).json({
        status: 'success',
        data: dayOffs,
    });
});

const createGlobalDayOff = catchAsync(async (req, res) => {
    const dayOff = await dayOffService.createDayOff(req.body, true);
    res.status(201).json({
        status: 'success',
        data: dayOff
    });
});

const createStaffDayOff = catchAsync(async (req, res) => {
    const dayOff = await dayOffService.createDayOff(req.body, false, req.body.staffIds);
    res.status(201).json({
        status: 'success',
        data: dayOff
    });
});

const createPartialDayOff = catchAsync(async (req, res) => {
    const { isGlobal } = req.body;
    const dayOff = await dayOffService.createPartialDayOff(
        req.body, 
        isGlobal,
        req.body.staffIds || []
    );
    
    res.status(201).json({
        status: 'success',
        data: dayOff
    });
});

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
    updateDayOff,
    getDayOffsByDate,
    createGlobalDayOff,
    createStaffDayOff,
    createPartialDayOff
};
