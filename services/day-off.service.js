const DayOff = require('../model/day-off.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');
const User = require('../model/user.model');
const { updateGlobalAvailability } = require('./booking.service');

const createDayOff = async (dateData, isGlobal = false, affectedStaff = []) => {
    const dayOffDate = new Date(dateData.date);
    
    // Create DayOff document
    const dayOffRecord = await DayOff.create({
        date: dayOffDate,
        reason: dateData.reason,
        isGlobal,
        isFullDay: true,
        affectedStaff
    });

    // Update WorkingHours
    await WorkingHours.findOneAndUpdate(
        { date: dayOffDate, isGlobal: true },
        {
            $set: {
                dayOff: true,
                unavailableSlots: getAllTimeSlots(),
                availableSlots: []
            }
        },
        { upsert: true, new: true }
    );

    return dayOffRecord;
};

const getAllTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 18; // 7 PM (19:00)
    
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute of ['00', '30']) {
            const period = hour >= 12 ? 'PM' : 'AM';
            let displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM
            if (hour > 12) displayHour = hour - 12;
            
            slots.push(`${displayHour}:${minute} ${period}`);
        }
    }
    return slots;
};

const getAllDayOffs = async (filters = {}) => {
    const query = {};
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = new Date(filters.startDate);
        if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    // Type filter
    if (filters.type) {
        if (filters.type === 'global') query.isGlobal = true;
        if (filters.type === 'staff') query.isGlobal = false;
    }

    // Staff filter
    if (filters.staffId) {
        query.affectedStaff = filters.staffId;
    }

    return await DayOff.find(query)
        .sort({ date: -1 })
        .populate('affectedStaff', 'name email')
        .lean();
};

const updateDayOff = async (dayOffId, updateData) => {
    const dayOff = await DayOff.findById(dayOffId);
    if (!dayOff) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Day off not found');
    }

    // Handle time range updates for partial day-offs
    if (!dayOff.isFullDay && (updateData.timeRange || updateData.startTime || updateData.endTime)) {
        const oldStart = updateData.timeRange?.startTime || dayOff.timeRange.startTime;
        const oldEnd = updateData.timeRange?.endTime || dayOff.timeRange.endTime;
        const newStart = updateData.startTime || oldStart;
        const newEnd = updateData.endTime || oldEnd;

        const oldSlots = generateTimeSlots(oldStart, oldEnd, 30);
        const newSlots = generateTimeSlots(newStart, newEnd, 30);

        const updateOperation = {
            $pull: { unavailableSlots: { $in: oldSlots } },
            $addToSet: { availableSlots: { $each: oldSlots } },
            $addToSet: { unavailableSlots: { $each: newSlots } },
            $pull: { availableSlots: { $in: newSlots } }
        };

        const query = dayOff.isGlobal ? 
            { date: dayOff.date, isGlobal: true } :
            { date: dayOff.date, staff: { $in: dayOff.affectedStaff } };

        await WorkingHours.updateMany(query, updateOperation);
    }

    // Handle staff changes
    if (updateData.staffIds) {
        const removedStaff = dayOff.affectedStaff.filter(
            staffId => !updateData.staffIds.includes(staffId.toString())
        );
        
        // Remove day-off from removed staff
        if (removedStaff.length > 0) {
            const slots = dayOff.isFullDay ? 
                getAllTimeSlots() :
                generateTimeSlots(dayOff.timeRange.startTime, dayOff.timeRange.endTime, 30);

            await WorkingHours.updateMany(
                { date: dayOff.date, staff: { $in: removedStaff } },
                {
                    $pull: { unavailableSlots: { $in: slots } },
                    $addToSet: { availableSlots: { $each: slots } }
                }
            );
        }

        // Add day-off to new staff
        const newStaff = updateData.staffIds.filter(
            staffId => !dayOff.affectedStaff.includes(staffId)
        );

        if (newStaff.length > 0) {
            const slots = dayOff.isFullDay ? 
                getAllTimeSlots() :
                generateTimeSlots(dayOff.timeRange.startTime, dayOff.timeRange.endTime, 30);

            await WorkingHours.updateMany(
                { date: dayOff.date, staff: { $in: newStaff } },
                {
                    $addToSet: { unavailableSlots: { $each: slots } },
                    $pull: { availableSlots: { $in: slots } }
                }
            );
        }
    }

    const updatedDayOff = await DayOff.findByIdAndUpdate(
        dayOffId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return updatedDayOff;
};

const deleteDayOff = async (dayOffId) => {
    const dayOff = await DayOff.findById(dayOffId);
    if (!dayOff) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Day off not found');
    }

    const slots = dayOff.isFullDay ? 
        getAllTimeSlots() :
        generateTimeSlots(dayOff.timeRange.startTime, dayOff.timeRange.endTime, 30);

    const updateOperation = {
        $set: { dayOff: false }, // Reset dayOff flag
        $pull: { unavailableSlots: { $in: slots } },
        $addToSet: { availableSlots: { $each: slots } }
    };

    const query = dayOff.isGlobal ?
        { date: dayOff.date, isGlobal: true } :
        { date: dayOff.date, staff: { $in: dayOff.affectedStaff } };

    await WorkingHours.updateMany(query, updateOperation);
    await DayOff.findByIdAndDelete(dayOffId);

    return { message: 'Day off deleted successfully' };
};

const getDayOffsByDate = async (date) => {
    const dayOffs = await DayOff.find({ date: new Date(date) });
    if (dayOffs.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No day-offs found for the given date');
    }
    return dayOffs;
};

// Helper function to generate time slots
const generateTimeSlots = (startTime, endTime, intervalMinutes) => {
    const slots = [];
    const [startHours, startMinutes, startPeriod] = parseTime(startTime);
    const [endHours, endMinutes, endPeriod] = parseTime(endTime);

    let current = new Date(1970, 0, 1);
    current.setHours(
        convertHourTo24(startHours, startPeriod),
        startMinutes
    );

    const end = new Date(1970, 0, 1);
    end.setHours(
        convertHourTo24(endHours, endPeriod),
        endMinutes
    );

    while (current <= end) {
        slots.push(formatTime(current));
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
};

const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    return [hours, minutes, period];
};

const convertHourTo24 = (hour, period) => {
    if (hour === 12) {
        return period === 'AM' ? 0 : 12;
    }
    return period === 'AM' ? hour : hour + 12;
};

const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
};

const parseAMPM = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    const formattedHours = period === 'PM' ? hours + 12 : hours;
    return formattedHours * 60 + minutes;
};

const createPartialDayOff = async (dateData, isGlobal, affectedStaff = []) => {
    const dayOffDate = new Date(dateData.date);
    
    // Generate time slots including end time
    const timeSlots = generateTimeSlots(
        dateData.startTime, 
        dateData.endTime, 
        30
    );

    // Check and initialize working hours if needed
    const query = isGlobal ?
        { date: dayOffDate, isGlobal: true } :
        { date: dayOffDate, staff: { $in: affectedStaff } };

    // Initialize working hours if they don't exist
    await WorkingHours.findOneAndUpdate(
        query,
        {
            $setOnInsert: {
                availableSlots: getAllTimeSlots(),
                unavailableSlots: [],
                dayOff: false
            }
        },
        { upsert: true }
    );

    // Update operation to move slots
    const updateOperation = {
        $addToSet: { unavailableSlots: { $each: timeSlots } },
        $pull: { availableSlots: { $in: timeSlots } }
    };

    if (isGlobal) {
        // Update global working hours
        await WorkingHours.updateOne(
            query,
            updateOperation
        );
    } else {
        // Update staff-specific working hours
        await WorkingHours.updateMany(
            query,
            updateOperation
        );
    }

    // Create day-off record
    return await DayOff.create({
        date: dayOffDate,
        reason: dateData.reason,
        isGlobal,
        isFullDay: false,
        timeRange: {
            startTime: dateData.startTime,
            endTime: dateData.endTime
        },
        affectedStaff
    });
};

module.exports = {
    createDayOff,
    getAllDayOffs,
    updateDayOff,
    deleteDayOff,
    getDayOffsByDate,
    createPartialDayOff
};
