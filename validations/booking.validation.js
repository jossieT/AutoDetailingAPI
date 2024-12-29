const joi = require('joi');

const createBookingSchema = {
    body: joi.object().keys({
        clientDetails: joi.object().keys({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            phone: joi.string().required(),
            email: joi.string().email().required(),
        }).required(),
        vehicleDetails: joi.object().keys({
            carType: joi.string().valid('SUV', 'AUTO').required(),
            make: joi.string().optional(),
            model: joi.string().optional(),
            year: joi.number().optional(),
        }).required(),
        services: joi.array().items(joi.string().required()).required(), // Assuming service IDs are strings
        selectedAddOns: joi.array().items(joi.string().optional()), // Assuming add-on service IDs are strings
        appointmentDate: joi.date().required(),
        serviceStartingTime: joi.string().required(),
        bookingEndTime: joi.string().optional(),
        status: joi.string().valid('Pending', 'Confirmed', 'Completed', 'Canceled').default('Pending'),
        assignedTo: joi.string().optional(), // Assuming user IDs are strings
    }),
};

const updateBookingSchema = {
    body: joi.object().keys({
        clientDetails: joi.object().keys({
            firstName: joi.string().optional(),
            lastName: joi.string().optional(),
            phone: joi.string().optional(),
            email: joi.string().email().optional(),
        }).optional(),
        vehicleDetails: joi.object().keys({
            carType: joi.string().valid('SUV', 'AUTO').optional(),
            make: joi.string().optional(),
            model: joi.string().optional(),
            year: joi.number().optional(),
        }).optional(),
        services: joi.array().items(joi.string().optional()).optional(), // Assuming service IDs are strings
        selectedAddOns: joi.array().items(joi.string().optional()), // Assuming add-on service IDs are strings
        appointmentDate: joi.date().required(),
        serviceStartingTime: joi.string().required(),
        bookingEndTime: joi.string().optional(),
        status: joi.string().valid('Pending', 'Confirmed', 'Completed', 'Canceled').optional(),
        assignedTo: joi.string().optional(), // Assuming user IDs are strings
    }),
    params: joi.object().keys({
        bookingId: joi.string().required(), // Assuming booking ID is a string
    }),
};

const getBookingSchema = {
    params: joi.object().keys({
        bookingId: joi.string().required(), // Assuming booking ID is a string
    }),
};

const deleteBookingSchema = {
    params: joi.object().keys({
        bookingId: joi.string().required(), // Assuming booking ID is a string
    }),
};

module.exports = {
    createBookingSchema,
    updateBookingSchema,
    getBookingSchema,
    deleteBookingSchema,
};