const joi = require('joi');

const createBookingSchema = {
    body: joi.object().keys({
        clientDetails: joi.object().keys({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            phone: joi.string().required(),
            email: joi.string().email().optional(),
        }).required(),
        vehicleDetails: joi.object().keys({
            carType: joi.string().valid('SUV', 'AUTO').required(),
            make: joi.string().optional(),
            model: joi.string().optional(),
            year: joi.number().optional(),
        }).required(),
        images: joi.array().items(
            joi.object().keys({
                url: joi.string().uri().optional(),
                description: joi.string().optional(),
            })
        ).optional(),
        location: joi.object().keys({
            address: joi.string().optional(),
            coordinates: joi.object().keys({
                latitude: joi.number().optional(),
                longitude: joi.number().optional(),
            }).optional(),
        }).required(),
        service_ids: joi.array().items(joi.string().hex().length(24).required()).required(), // Assuming service IDs are MongoDB ObjectIds
        selectedAddOns: joi.array().items(joi.string().optional()), // Assuming add-on service IDs are strings
        appointmentDate: joi.date().required(),
        serviceStartingTime: joi.string().required(),
        bookingEndTime: joi.string().optional(),
        appointmentNote: joi.string().allow('').optional(),
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
        images: joi.array().items(
            joi.object().keys({
                url: joi.string().uri().optional(),
                description: joi.string().optional(),
            })
        ).optional(),
        location: joi.object().keys({
            address: joi.string().optional(),
            coordinates: joi.object().keys({
                latitude: joi.number().optional(),
                longitude: joi.number().optional(),
            }).optional(),
        }).optional(),
        service_ids: joi.array().items(joi.string().hex().length(24).optional()).optional(), // Assuming service IDs are MongoDB ObjectIds
        selectedAddOns: joi.array().items(joi.string().hex().length(24).optional()).optional(), // Assuming add-on service IDs are MongoDB ObjectIds
        appointmentDate: joi.date().optional(),
        serviceStartingTime: joi.string().optional(),
        bookingEndTime: joi.string().optional(),
        status: joi.string().valid('Pending', 'Confirmed', 'Completed', 'Canceled').optional(),
        assignedTo: joi.string().hex().length(24).optional(), // Assuming user IDs are MongoDB ObjectIds
        appointmentNote: joi.string().optional(),
        totalPrice: joi.number().optional(),
    }),
    params: joi.object().keys({
        bookingId: joi.string().hex().length(24).required(), // Assuming booking ID is a MongoDB ObjectId
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

module.exports = {
    createBookingSchema,
    updateBookingSchema,
    getBookingSchema,
    deleteBookingSchema,
    approveBooking,
    cancelBooking,
};