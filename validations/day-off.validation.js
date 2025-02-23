const joi = require('joi');

const timePattern = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/;

const createDayOffSchema = {
    body: joi.object().keys({
        date: joi.date().required(),
        reason: joi.string().required(),
        isFullDay: joi.boolean().default(false),
        startTime: joi.string().pattern(timePattern)
            .message('Start time must be in format "HH:MM AM/PM"')
            .when('isFullDay', {
                is: true,
                then: joi.optional(),
                otherwise: joi.required()
            }),
        endTime: joi.string().pattern(timePattern)
            .message('End time must be in format "HH:MM AM/PM"')
            .when('isFullDay', {
                is: true,
                then: joi.optional(),
                otherwise: joi.required()
            })
    }).custom((value, helpers) => {
        if (!value.isFullDay && value.startTime && value.endTime) {
            const start = convertTo24Hour(value.startTime);
            const end = convertTo24Hour(value.endTime);
            
            const startDate = new Date(`1970-01-01T${start}`);
            const endDate = new Date(`1970-01-01T${end}`);
            
            if (startDate >= endDate) {
                return helpers.error('End time must be after start time');
            }
        }
        return value;
    }),
};

const deleteDayOffSchema = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required()
    }),
};

const updateDayOffSchema = {
    params: joi.object().keys({
        dayOffId: joi.string().hex().length(24).required()
    }),
    body: joi.object().keys({
        reason: joi.string(),
        timeRange: joi.object({
            startTime: joi.string().pattern(timePattern)
                .message('Start time must be in format "HH:MM AM/PM"'),
            endTime: joi.string().pattern(timePattern)
                .message('End time must be in format "HH:MM AM/PM"')
        }),
        status: joi.string().valid('active', 'cancelled')
    }).min(1)
};

const getDayOffsByDate = {
    params: joi.object().keys({
        date: joi.date().required(),
    }),
};

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours, 10);
    if (hours === 12) {
        hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
        hours = hours + 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};



module.exports = {
    createDayOffSchema,
    deleteDayOffSchema,
    updateDayOffSchema,
    getDayOffsByDate
}; 