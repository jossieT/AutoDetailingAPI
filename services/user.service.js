const User = require('../model/user.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');


const createUser = async (userBody) => {

    const isEmailTaken = await User.isEmailTaken(userBody.email);
    if (isEmailTaken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email is already Taken");
    }

    return await User.create(userBody);
};

const getUser = async () => {
    const user = await User.find({});
    return user;
}

const getUserByEmail = async (email) => {
     const user = await User.findOne({ email });
     return user;
}

const getUserById = async (userId) => {
    const user = await User.findById(userId);
    return user;
}

const getProfile = async (userId) => {
    const user = await User.findById(userId)
        .select('-password')  // Exclude password from the response
        .populate({
            path: 'assignedBookings',
            select: 'appointmentDate serviceStartingTime status clientDetails vehicleDetails',
            options: { sort: { appointmentDate: -1 } }
        });
    
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const updateProfile = async (userId, updateBody) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Prevent updating role through this endpoint
    delete updateBody.role;
    
    // Check if email is being updated and if it's already taken
    if (updateBody.email && 
        updateBody.email !== user.email && 
        (await User.isEmailTaken(updateBody.email))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    Object.assign(user, updateBody);
    await user.save();
    
    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    return userWithoutPassword;
};

module.exports = {
    createUser,
    getUser,
    getUserByEmail,
    getUserById,
    getProfile,
    updateProfile
}