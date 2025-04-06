const joi = require('joi');

const createBookingSchema = {
    body: joi.object().keys({
        // Client Details
        'clientDetails.firstName': joi.string().required(),
        'clientDetails.lastName': joi.string().required(),
        'clientDetails.phone': joi.string().required(),
        'clientDetails.email': joi.string().email().allow('', null),

        // Vehicle Details
        'vehicleDetails.carType': joi.string().valid('SUV', 'AUTO').required(),
        'vehicleDetails.make': joi.string().allow('', null),
        'vehicleDetails.model': joi.string().allow('', null),
        'vehicleDetails.year': joi.string().allow('', null),

        // Location
        'location.address': joi.string().allow('', null),
        'location.coordinates.latitude': joi.string().allow('', null),
        'location.coordinates.longitude': joi.string().allow('', null),

        service_ids: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        ).required(),

        selectedAddOns: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        ).optional(),

        appointmentDate: joi.string().required(),
        serviceStartingTime: joi.string()
            .pattern(/^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/)
            .message('Service starting time must be in format "HH:MM AM/PM"')
            .required(),

        appointmentNote: joi.string().allow('', null),
        images: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.any())
        ).optional(),
    }).unknown(true),
};

const updateBookingSchema = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        // Client Details
        'clientDetails.firstName': joi.string(),
        'clientDetails.lastName': joi.string(),
        'clientDetails.phone': joi.string(),
        'clientDetails.email': joi.string().email(),
        
        // Vehicle Details
        'vehicleDetails.carType': joi.string().valid('SUV', 'AUTO'),
        'vehicleDetails.make': joi.string(),
        'vehicleDetails.model': joi.string(),
        'vehicleDetails.year': joi.string(),
        
        // Location
        'location.address': joi.string(),
        'location.coordinates.latitude': joi.string(),
        'location.coordinates.longitude': joi.string(),
        
        service_ids: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        ),
        
        selectedAddOns: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        ),
        
        appointmentDate: joi.string(),
        serviceStartingTime: joi.string()
            .pattern(/^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/)
            .message('Service starting time must be in format "HH:MM AM/PM"'),
        bookingEndTime: joi.string()
            .pattern(/^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/)
            .message('Booking end time must be in format "HH:MM AM/PM"'),
        
        status: joi.string().valid('Pending', 'Confirmed', 'Completed', 'Canceled'),
        assignedTo: joi.string().hex().length(24),
        appointmentNote: joi.string().allow('', null),
        totalPrice: joi.number(),
        images: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.any())
        ).optional(),
    }).unknown(true),
};

const getBookingSchema = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
};

const deleteBookingSchema = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
};

const approveBooking = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
};

const cancelBooking = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        canceledBy: joi.string().optional(),
    }),
};

const markAsCompleted = {
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(),
    }),
};

const getWorkingHoursBreakdown = {
    query: joi.object().keys({
        date: joi.date().iso().required()
    })
};

module.exports = {
    createBookingSchema,
    updateBookingSchema,
    getBookingSchema,
    deleteBookingSchema,
    approveBooking,
    cancelBooking,
    markAsCompleted,
    getWorkingHoursBreakdown
};