const bookingService = require('../services/booking.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
//const cloudinary = require('../config/cloudinary');

// Controller to get available slots for a given date
const getAvailableSlots = catchAsync(async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const slots = await bookingService.getAvailableSlots(date);

    res.status(200).json({ availableSlots: slots });
});


// Create a new booking
const createBooking = catchAsync(async (req, res) => {
    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => ({
            url: file.path,
            description: ''
        }));
    } else if (req.body.images) {
        imageUrls = Array.isArray(req.body.images) 
            ? req.body.images.map(url => ({ url, description: '' }))
            : [{ url: req.body.images, description: '' }];
    }

    // Transform form-data to match the model structure
    const bookingData = {
        clientDetails: {
            firstName: req.body['clientDetails.firstName'],
            lastName: req.body['clientDetails.lastName'],
            phone: req.body['clientDetails.phone'],
            email: req.body['clientDetails.email'],
        },
        vehicleDetails: {
            carType: req.body['vehicleDetails.carType'],
            make: req.body['vehicleDetails.make'],
            model: req.body['vehicleDetails.model'],
            year: req.body['vehicleDetails.year'],
        },
        location: {
            address: req.body['location.address'],
            coordinates: {
                latitude: req.body['location.coordinates.latitude'],
                longitude: req.body['location.coordinates.longitude'],
            },
        },
        service_ids: Array.isArray(req.body.service_ids) 
            ? req.body.service_ids 
            : [req.body.service_ids],
        selectedAddOns: req.body.selectedAddOns 
            ? (Array.isArray(req.body.selectedAddOns) 
                ? req.body.selectedAddOns 
                : [req.body.selectedAddOns])
            : [],
        appointmentDate: req.body.appointmentDate,
        serviceStartingTime: req.body.serviceStartingTime,
        appointmentNote: req.body.appointmentNote,
        images: imageUrls
    };

    const booking = await bookingService.createBooking(bookingData);
    res.status(201).json({
        status: 'success',
        data: booking
    });
});

// Get all bookings
const getAllBookings = catchAsync(async (req, res) => {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
});

// Get a booking by ID
const getBookingById = catchAsync(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.bookingId);
    res.status(200).json(booking);
});

// Update a booking by ID
const updateBookingById = catchAsync(async (req, res) => {
    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => ({
            url: file.path,
            description: ''
        }));
    }

    // Transform form-data to match the model structure
    const bookingData = {};

    // Only include fields that are present in the request
    if (req.body['clientDetails.firstName'] || req.body['clientDetails.lastName'] || 
        req.body['clientDetails.phone'] || req.body['clientDetails.email']) {
        bookingData.clientDetails = {
            ...(req.body['clientDetails.firstName'] && { firstName: req.body['clientDetails.firstName'] }),
            ...(req.body['clientDetails.lastName'] && { lastName: req.body['clientDetails.lastName'] }),
            ...(req.body['clientDetails.phone'] && { phone: req.body['clientDetails.phone'] }),
            ...(req.body['clientDetails.email'] && { email: req.body['clientDetails.email'] }),
        };
    }

    if (req.body['vehicleDetails.carType'] || req.body['vehicleDetails.make'] || 
        req.body['vehicleDetails.model'] || req.body['vehicleDetails.year']) {
        bookingData.vehicleDetails = {
            ...(req.body['vehicleDetails.carType'] && { carType: req.body['vehicleDetails.carType'] }),
            ...(req.body['vehicleDetails.make'] && { make: req.body['vehicleDetails.make'] }),
            ...(req.body['vehicleDetails.model'] && { model: req.body['vehicleDetails.model'] }),
            ...(req.body['vehicleDetails.year'] && { year: req.body['vehicleDetails.year'] }),
        };
    }

    if (req.body['location.address'] || req.body['location.coordinates.latitude'] || 
        req.body['location.coordinates.longitude']) {
        bookingData.location = {
            ...(req.body['location.address'] && { address: req.body['location.address'] }),
            ...(req.body['location.coordinates.latitude'] || req.body['location.coordinates.longitude']) && {
                coordinates: {
                    ...(req.body['location.coordinates.latitude'] && { 
                        latitude: req.body['location.coordinates.latitude'] 
                    }),
                    ...(req.body['location.coordinates.longitude'] && { 
                        longitude: req.body['location.coordinates.longitude'] 
                    }),
                }
            }
        };
    }

    if (req.body.service_ids) {
        bookingData.service_ids = Array.isArray(req.body.service_ids) 
            ? req.body.service_ids 
            : [req.body.service_ids];
    }

    if (req.body.selectedAddOns) {
        bookingData.selectedAddOns = Array.isArray(req.body.selectedAddOns) 
            ? req.body.selectedAddOns 
            : [req.body.selectedAddOns];
    }

    if (req.body.appointmentDate) {
        bookingData.appointmentDate = req.body.appointmentDate;
    }

    if (req.body.serviceStartingTime) {
        bookingData.serviceStartingTime = req.body.serviceStartingTime;
    }

    if (req.body.appointmentNote) {
        bookingData.appointmentNote = req.body.appointmentNote;
    }

    if (req.files && req.files.length > 0) {
        bookingData.images = imageUrls;
    }

    if (req.body.status) {
        bookingData.status = req.body.status;
    }

    const updatedBooking = await bookingService.updateBookingById(req.params.bookingId, bookingData);
    res.status(200).json({
        status: 'success',
        data: updatedBooking
    });
});

// Delete a booking by ID
const deleteBookingById = catchAsync(async (req, res) => {
    //console.log('Full user object from request:', req.user);
    
    if (!req.user || !req.user._id) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required - No user found in request'
        });
    }

    const result = await bookingService.deleteBookingById(
        req.params.bookingId,
        req.user._id
    );
    
    res.status(200).json({
        status: 'success',
        message: result.message
    });
});

//assign staff to booking
const assignUserToBooking = catchAsync(async (req, res) => {
    const { bookingId, userId } = req.params;
    const updatedBooking = await bookingService.assignUserToBooking(bookingId, userId);
    res.status(200).json(updatedBooking);
});

const approveBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.approveBooking(req.params.bookingId);
    res.status(200).json({ message: 'Booking approved successfully', data: booking });
});

const cancelBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.params.bookingId);
    res.status(200).json({ message: 'Booking canceled successfully', data: booking });
});

const markAsCompleted = catchAsync(async (req, res) => {
    const booking = await bookingService.markAsCompleted(req.params.bookingId);
    res.status(200).json({ message: 'Booking marked as completed successfully', data: booking });
});

const getDeletedBookings = catchAsync(async (req, res) => {
    const deletedBookings = await bookingService.getDeletedBookings();
    res.status(200).json({
        status: 'success',
        data: deletedBookings
    });
});

const getWorkingHoursBreakdown = catchAsync(async (req, res) => {
    const { date } = req.query;
    const breakdown = await bookingService.getWorkingHoursBreakdown(date);
    res.send(breakdown);
});

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById,
    assignUserToBooking,
    getAvailableSlots,
    approveBooking,
    cancelBooking,
    markAsCompleted,
    getDeletedBookings,
    getWorkingHoursBreakdown
};
