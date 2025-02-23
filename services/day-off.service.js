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
    }

    // Check if it's already marked as full day off
    if (workingHours.dayOff) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'This day is already marked as a full day off');
    }

    if (isFullDay) {
        // Check if there are any existing partial day-offs
        const existingDayOffs = await DayOff.find({
            date: new Date(date),
            isFullDay: false,
            status: 'active'
        });

        if (existingDayOffs.length > 0) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Cannot mark full day off when partial day-offs exist'
            );
        }

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

        // Check for overlapping time ranges
        const existingDayOffs = await DayOff.find({
            date: new Date(date),
            isFullDay: false,
            status: 'active'
        });

        const newStart = parseAMPM(startTime);
        const newEnd = parseAMPM(endTime);

        for (const dayOff of existingDayOffs) {
            const existingStart = parseAMPM(dayOff.timeRange.startTime);
            const existingEnd = parseAMPM(dayOff.timeRange.endTime);

            if (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            ) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Time range overlaps with existing day-off (${dayOff.timeRange.startTime} - ${dayOff.timeRange.endTime})`
                );
            }
        }

        // Generate slots between start and end time
        const affectedSlots = generateTimeSlots(startTime, endTime, 30);

        // Check if any of these slots are already marked as unavailable
        const unavailableSlots = affectedSlots.filter(slot =>
            workingHours.unavailableSlots.includes(slot)
        );

        if (unavailableSlots.length > 0) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Some slots are already marked as unavailable: ${unavailableSlots.join(', ')}`
            );
        }

        // Add the new partial day off
        workingHours.partialDayOff.push({
            startTime,
            endTime,
            reason
        });

        // Update available and unavailable slots
        workingHours.unavailableSlots = [...workingHours.unavailableSlots, ...affectedSlots];
        workingHours.availableSlots = workingHours.availableSlots.filter(
            slot => !affectedSlots.includes(slot)
        );
    }

    await workingHours.save();

    // Create the day off record
    const dayOff = await DayOff.create({
        date: new Date(date),
        reason,
        isFullDay,
        timeRange: isFullDay ? undefined : { startTime, endTime }
    });

    return dayOff;
};

const getAllDayOffs = async () => {
    return await DayOff.find().sort({ date: 1 });
};

const updateDayOff = async (dayOffId, updateData) => {
    const dayOff = await DayOff.findById(dayOffId);
    if (!dayOff) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Day off not found');
    }

    // If updating time range for a partial day off
    if (!dayOff.isFullDay && (updateData.timeRange || updateData.startTime || updateData.endTime)) {
        const startTime = updateData.timeRange?.startTime || updateData.startTime || dayOff.timeRange.startTime;
        const endTime = updateData.timeRange?.endTime || updateData.endTime || dayOff.timeRange.endTime;

        // Update working hours
        const workingHours = await WorkingHours.findOne({ date: dayOff.date });
        if (workingHours) {
            // Remove old time slots
            const oldSlots = generateTimeSlots(dayOff.timeRange.startTime, dayOff.timeRange.endTime, 30);
            workingHours.unavailableSlots = workingHours.unavailableSlots.filter(
                slot => !oldSlots.includes(slot)
            );
            workingHours.availableSlots.push(...oldSlots);

            // Add new time slots
            const newSlots = generateTimeSlots(startTime, endTime, 30);
            workingHours.unavailableSlots.push(...newSlots);
            workingHours.availableSlots = workingHours.availableSlots.filter(
                slot => !newSlots.includes(slot)
            );

            await workingHours.save();
        }

        // Update the day off record
        updateData.timeRange = { startTime, endTime };
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

    // Update working hours
    const workingHours = await WorkingHours.findOne({ date: dayOff.date });
    if (workingHours) {
        if (dayOff.isFullDay) {
            workingHours.dayOff = false;
            workingHours.availableSlots = generateTimeSlots('6:00 AM', '7:00 PM', 30);
            workingHours.unavailableSlots = [];
        } else {
            const slotsToRelease = generateTimeSlots(
                dayOff.timeRange.startTime,
                dayOff.timeRange.endTime,
                30
            );
            workingHours.unavailableSlots = workingHours.unavailableSlots.filter(
                slot => !slotsToRelease.includes(slot)
            );
            workingHours.availableSlots.push(...slotsToRelease);
            workingHours.partialDayOff = workingHours.partialDayOff.filter(
                pdo => pdo.startTime !== dayOff.timeRange.startTime ||
                    pdo.endTime !== dayOff.timeRange.endTime
            );
        }
        await workingHours.save();
    }

    await DayOff.findByIdAndDelete(dayOffId);
    return { message: 'Day off deleted successfully' };
};

const getDayOffsByDate = async (date) => {
    const dayOffs = await DayOff.find({ date: new Date(date) });
    if (!dayOffs) {
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

const parseAMPM = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    const formattedHours = period === 'PM' ? hours + 12 : hours;
    return formattedHours * 60 + minutes;
};

module.exports = {
    createDayOff,
    getAllDayOffs,
    updateDayOff,
    deleteDayOff,
    getDayOffsByDate
};
