const DayOff = require('../model/day-off.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const createDayOff = async (data) => {
    const { date, reason, times } = data;
    
    // Find working hours for the given date
    let workingHours = await WorkingHours.findOne({ date: new Date(date) });
    
    // If working hours don't exist, initialize them
    if (!workingHours) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Working hours not initialized for this date');
    }

    // Handle full day off
    if (!times || times.length === 0) {
        workingHours.dayOff = true;
        // Move all available slots to unavailable
        workingHours.unavailableSlots = [...workingHours.availableSlots];
        workingHours.availableSlots = [];
    } else {
        // Handle specific times off
        workingHours.partialDayOff = [...times];
        
        // Move specified times from available to unavailable
        times.forEach(time => {
            const timeIndex = workingHours.availableSlots.indexOf(time);
            if (timeIndex !== -1) {
                workingHours.availableSlots.splice(timeIndex, 1);
                if (!workingHours.unavailableSlots.includes(time)) {
                    workingHours.unavailableSlots.push(time);
                }
            }
        });
    }

    await workingHours.save();

    // Create day off record
    return await DayOff.create({
        date: new Date(date),
        reason,
        times: times || [],
    });
};

const getAllDayOffs = async () => {
    return await DayOff.find().sort({ date: 1 });
};

const deleteDayOff = async (date) => {
    const dayOff = await DayOff.findOne({ date: new Date(date) });
    if (!dayOff) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Day off not found');
    }

    // Find working hours for the date
    const workingHours = await WorkingHours.findOne({ date: new Date(date) });
    if (workingHours) {
        if (dayOff.times && dayOff.times.length > 0) {
            // Restore specific times to available slots
            dayOff.times.forEach(time => {
                const timeIndex = workingHours.unavailableSlots.indexOf(time);
                if (timeIndex !== -1) {
                    workingHours.unavailableSlots.splice(timeIndex, 1);
                    if (!workingHours.availableSlots.includes(time)) {
                        workingHours.availableSlots.push(time);
                    }
                }
            });
            workingHours.partialDayOff = [];
        } else {
            // Restore full day availability
            workingHours.dayOff = false;
            // Reset to default available slots
            const defaultSlots = generateTimeSlots('06:00', '19:00', 30);
            workingHours.availableSlots = defaultSlots;
            workingHours.unavailableSlots = [];
        }
        await workingHours.save();
    }

    return await DayOff.findOneAndDelete({ date: new Date(date) });
};

// Helper function to generate time slots
const generateTimeSlots = (startTime, endTime, intervalMinutes) => {
    const slots = [];
    let current = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (current < end) {
        const hours = current.getHours();
        const minutes = current.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes} ${period}`;
        slots.push(formattedTime);
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
};

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
};
