const DayOff = require('../model/day-off.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const createDayOff = async (data) => {
    const { date, reason, startTime, endTime, isFullDay } = data;
    
    // Find or initialize working hours for the given date
    let workingHours = await WorkingHours.findOne({ date: new Date(date) });
    
    // If working hours don't exist, initialize them
    if (!workingHours) {
        const timeSlots = generateTimeSlots('6:00 AM', '7:00 PM', 30);
        workingHours = new WorkingHours({
            date: new Date(date),
            availableSlots: timeSlots,
            unavailableSlots: [],
            dayOff: false,
            partialDayOff: [],
        });
        await workingHours.save();
    }

    // Check if it's already marked as full day off
    if (workingHours.dayOff) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'This day is already marked as a full day off');
    }

    // Determine if it's a full day off
    const shouldBeFullDay = isFullDay === true || (!startTime && !endTime);
    
    if (shouldBeFullDay) {
        // Handle full day off
        workingHours.dayOff = true;
        workingHours.unavailableSlots = [...workingHours.unavailableSlots, ...workingHours.availableSlots];
        workingHours.availableSlots = [];
        workingHours.partialDayOff = [];
    } else {
        // Validate that we have both start and end times for partial day off
        if (!startTime || !endTime) {
            throw new ApiError(
                httpStatus.BAD_REQUEST, 
                'Both start time and end time are required for partial day off'
            );
        }

        // Handle partial day off
        const affectedSlots = generateTimeSlots(startTime, endTime, 30);
        
        // Check if any of these slots are already marked as unavailable
        const unavailableSlots = affectedSlots.filter(slot => 
            workingHours.unavailableSlots.includes(slot)
        );
        
        if (unavailableSlots.length > 0) {
            throw new ApiError(
                httpStatus.BAD_REQUEST, 
                `Some time slots are already marked as off: ${unavailableSlots.join(', ')}`
            );
        }

        // Move specified times from available to unavailable
        affectedSlots.forEach(time => {
            const timeIndex = workingHours.availableSlots.indexOf(time);
            if (timeIndex !== -1) {
                workingHours.availableSlots.splice(timeIndex, 1);
                workingHours.unavailableSlots.push(time);
            }
        });

        // Add to partial day off records as an object with the correct schema
        const partialDayOffEntry = {
            startTime,
            endTime,
            reason
        };
        
        workingHours.partialDayOff.push(partialDayOffEntry);
    }

    await workingHours.save();

    // Create day off record
    const dayOff = await DayOff.create({
        date: new Date(date),
        reason,
        isFullDay: shouldBeFullDay,
        timeRange: !shouldBeFullDay ? { startTime, endTime } : null
    });

    return dayOff;
};

const getAllDayOffs = async () => {
    return await DayOff.find().sort({ date: 1 });
};

const deleteDayOff = async (id) => {
    const dayOff = await DayOff.findById(id);
    if (!dayOff) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Day off not found');
    }

    // Find working hours for the date
    const workingHours = await WorkingHours.findOne({ date: dayOff.date });
    if (workingHours) {
        if (dayOff.isFullDay) {
            // Reset to default available slots
            const defaultSlots = generateTimeSlots('6:00 AM', '7:00 PM', 30);
            workingHours.availableSlots = defaultSlots;
            workingHours.unavailableSlots = [];
            workingHours.dayOff = false;
            workingHours.partialDayOff = [];
        } else if (dayOff.timeRange) {
            // Restore specific time range to available slots
            const slotsToRestore = generateTimeSlots(
                dayOff.timeRange.startTime, 
                dayOff.timeRange.endTime, 
                30
            );
            
            slotsToRestore.forEach(time => {
                const timeIndex = workingHours.unavailableSlots.indexOf(time);
                if (timeIndex !== -1) {
                    workingHours.unavailableSlots.splice(timeIndex, 1);
                    workingHours.availableSlots.push(time);
                }
            });

            // Remove from partial day off records
            workingHours.partialDayOff = workingHours.partialDayOff.filter(
                off => off.startTime !== dayOff.timeRange.startTime || 
                       off.endTime !== dayOff.timeRange.endTime
            );
        }
        await workingHours.save();
    }

    return await DayOff.findByIdAndDelete(id);
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

    while (current < end) {
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

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
};
