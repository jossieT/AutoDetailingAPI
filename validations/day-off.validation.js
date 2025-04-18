const joi = require('joi');

const timePattern = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/;

const createDayOffSchema = {
    body: joi.object().keys({
        date: joi.date().iso().required(),
        reason: joi.string().required(),
        isFullDay: joi.boolean().required(),
        startTime: joi.when('isFullDay', {
            is: false,
            then: joi.string().pattern(timePattern).required()
        }),
        endTime: joi.when('isFullDay', {
            is: false,
            then: joi.string().pattern(timePattern).required()
        })
    })
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
        isGlobal: joi.boolean(),
        isFullDay: joi.boolean(),
        startTime: joi.string().pattern(timePattern)
            .when('isFullDay', { is: false, then: joi.required() }),
        endTime: joi.string().pattern(timePattern)
            .when('isFullDay', { is: false, then: joi.required() }),
        staffIds: joi.array().items(joi.string().hex().length(24))
            .when('isGlobal', { is: true, then: joi.forbidden() })
    }).min(1)
};

const getDayOffsSchema = {
    query: joi.object().keys({
        startDate: joi.date().iso(),
        endDate: joi.date().iso(),
        type: joi.string().valid('global', 'staff'),
        staffId: joi.string().hex().length(24)
    })
};

const createDayOff = {
    body: joi.object().keys({
        date: joi.date().iso().required(),
        reason: joi.string().required()
    })
};

const createStaffDayOffSchema = {
    body: joi.object().keys({
        date: joi.date().iso().required(),
        reason: joi.string().required(),
        isFullDay: joi.boolean().required(),
        staffIds: joi.array().items(
            joi.string().hex().length(24)
        ).required(),
        startTime: joi.when('isFullDay', {
            is: false,
            then: joi.string().pattern(timePattern).required()
        }),
        endTime: joi.when('isFullDay', {
            is: false,
            then: joi.string().pattern(timePattern).required()
        })
    })
};

const createPartialDayOffSchema = {
    body: joi.object().keys({
        date: joi.date().iso().required(),
        reason: joi.string().required(),
        isGlobal: joi.boolean().required(),
        affectedStaff: joi.array().items(
            joi.string().hex().length(24)
        ).when('isGlobal', {
            is: false,
            then: joi.required()
        }),
        startTime: joi.string().pattern(timePattern).required(),
        endTime: joi.string().pattern(timePattern).required()
    })
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
    getDayOffsSchema,
    createDayOff,
    createStaffDayOffSchema,
    createPartialDayOffSchema
}; 