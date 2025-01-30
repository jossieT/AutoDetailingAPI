const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const httpStatus = require('http-status');

const getMyProfile = catchAsync(async (req, res) => {
    // Handle both cases where user might be a promise or direct object
    const userId = req.user._id || (await req.user)._id;
    const profile = await userService.getProfile(userId);
    res.status(httpStatus.OK).json({
        status: 'success',
        data: profile
    });
});

const updateMyProfile = catchAsync(async (req, res) => {
    const userId = req.user._id || (await req.user)._id;
    const updatedProfile = await userService.updateProfile(userId, req.body);
    res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});

module.exports = {
    getMyProfile,
    updateMyProfile
}; 