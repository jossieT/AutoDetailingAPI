const bookingService = require('../services/booking.service');
const catchAsync = require('../utils/catchAsync');
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
    
   // Upload images to Cloudinary
   let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map((file) => file.path);
        } else {
            console.warn('No files uploaded!');
        }

    
     req.body.images = imageUrls;
     //console.log('Request Body:', req.body);
    const booking = await bookingService.createBooking(req.body);
    //booking.assignedTo = staff._id;
    res.status(201).json(booking);
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
    const updatedBooking = await bookingService.updateBookingById(req.params.bookingId, req.body);
    res.status(200).json(updatedBooking);
});

// Delete a booking by ID
const deleteBookingById = catchAsync(async (req, res) => {
    await bookingService.deleteBookingById(req.params.bookingId);
    res.status(200).json({ message: "Booking deleted successfully." });
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


module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById,
    assignUserToBooking,
    getAvailableSlots,
    approveBooking,
    cancelBooking
};
