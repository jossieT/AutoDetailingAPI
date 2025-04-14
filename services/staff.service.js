const User = require('../model/user.model');
const Booking = require('../model/booking.model');
const WorkingHours = require('../model/working.hours.model');
const {ApiError} = require('../utils/ApiError');
const httpStatus = require('http-status');
const mongoose = require('mongoose');

//Get All staff list
const staffList = async () => {
    const staffs = User.find({})
        .populate({
            path: 'assignedBookings',
            select: 'serviceStartingTime serviceEndTime clientDetails -_id', // Customize the fields to return
        });
    // .populate('assignedBookings', 'clientDetails appointmentDate serviceStartingTime serviceEndingTime') // Populate service details
    // .exec();
    if (!staffs) {
        throw new Error('Staff List empty');
    }

    return staffs;
}
// Add new staff
const addStaff = async (data) => {
    const { name, email, password, phone } = data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email is already in use');

    // Create a new staff member
    const newStaff = await User.create({ name, email, password, phone, role: 'staff' });
    return newStaff;
};

// Edit staff details
const editStaff = async (staffId, data) => {
    const updatedStaff = await User.findByIdAndUpdate(staffId, data, { new: true, runValidators: true });
    if (!updatedStaff) throw new Error('Staff not found');
    return updatedStaff;
};

// Delete staff
const deleteStaff = async (staffId) => {
    const deletedStaff = await User.findByIdAndDelete(staffId);
    if (!deletedStaff) throw new Error('Staff not found');
    return deletedStaff;
};

// Get bookings assigned to a staff member
const getStaffBookings = async (staffId) => {
    const staff = await User.findById(staffId)
        .populate({
            path: 'assignedBookings',
            populate: [{
                path: 'service_ids',
                select: 'name basePrice duration'
            }, {
                path: 'selectedAddOns',
                select: 'optionName additionalPrice'
            }]
        });

    if (!staff || staff.role !== 'staff') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Staff not found');
    }

    return staff.assignedBookings;
};

// Get staff by ID
const getStaffById = async (staffId) => {
    const staff = await User.findOne({ _id: staffId })
        .populate({
            path: 'assignedBookings',
            select: 'serviceStartingTime serviceEndTime clientDetails -_id',
        });
    
    if (!staff) {
        throw new Error('Staff member not found');
    }

    return staff;
};

const initializeStaffWorkingHours = async (staffId, date) => {
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Staff member not found');
    }

    const existingHours = await WorkingHours.findOne({ 
        date: new Date(date),
        staff: staffId
    });

    if (!existingHours) {
        // Create default working hours (e.g., 6 AM - 7 PM)
        const newWorkingHours = await WorkingHours.create({
            date,
            staff: staffId,
            availableSlots: generateTimeSlots('06:00', '19:00', 30),
            unavailableSlots: [],
            dayOff: false
        });

        await User.findByIdAndUpdate(staffId, {
            $addToSet: { workingHours: newWorkingHours._id }
        });
    }

    return await WorkingHours.findOne({ staff: staffId, date: new Date(date) });
};

const assignWorkingHoursToStaff = async (staffId, workingHoursId) => {
    const [staff, workingHours] = await Promise.all([
        User.findById(staffId),
        WorkingHours.findById(workingHoursId)
    ]);

    if (!staff || staff.role !== 'staff') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Staff member not found');
    }

    if (!workingHours) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Working hours template not found');
    }

    // Clone the working hours for this specific staff member
    const newHours = await WorkingHours.create({
        ...workingHours.toObject(),
        _id: new mongoose.Types.ObjectId(),
        staff: staffId
    });

    await User.findByIdAndUpdate(staffId, {
        $addToSet: { workingHours: newHours._id }
    });

    return newHours;
};

const createCustomWorkingHours = async (staffId, { date, slots, dayOff }) => {
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Staff member not found');
    }

    const newHours = await WorkingHours.create({
        date: new Date(date),
        staff: staffId,
        availableSlots: slots,
        unavailableSlots: [],
        dayOff: dayOff || false
    });

    await User.findByIdAndUpdate(staffId, {
        $addToSet: { workingHours: newHours._id }
    });

    return newHours;
};

// Run daily at midnight
const resetRotationIndexes = async () => {
    await User.updateMany(
        { role: 'staff' },
        { $set: { lastAssignedIndex: 0 } }
    );
};

module.exports = { addStaff, editStaff, deleteStaff, getStaffBookings, staffList, getStaffById };
