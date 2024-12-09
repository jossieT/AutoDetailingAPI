const Booking = require('../model/booking.model');
const DayOff = require('../model/day-off.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const calculateTotalPrice = (services) => {
    // Use reduce to sum up all service base prices
    return services.reduce((total, service) => total + service.basePrice, 0);
};

// Generate all time slots between startTime and endTime with the given interval
const generateTimeSlots = (startTime, endTime, intervalMinutes) => {
    const slots = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let currentHours = startHours;
    let currentMinutes = startMinutes;

    while (
        currentHours < endHours || 
        (currentHours === endHours && currentMinutes < endMinutes)
    ) {
        slots.push(
            `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`
        );
        currentMinutes += intervalMinutes;
        if (currentMinutes >= 60) {
            currentHours += 1;
            currentMinutes -= 60;
        }
    }

    return slots;
};


// Fetch available slots for a given date
const getAvailableSlots = async (date) => {
    // Fetch working hours
    const workingHours = await WorkingHours.findOne(); // Assuming static working hours

    if (!workingHours) {
        throw new Error('Working hours are not configured');
    }

    const { startTime, endTime, intervalMinutes } = workingHours;

    // console.log('workingHours:', workingHours);
    // console.log('Type of workingHours:', typeof workingHours);

    // Generate all time slots
    const allSlots = generateTimeSlots(startTime, endTime, intervalMinutes);

    // Check if the date is a day off
    const dayOff = await DayOff.findOne({ date });

    if (dayOff) {
        if (dayOff.times && dayOff.times.length > 0) {
            // Exclude specific times from working hours
            return allSlots.filter(time => !dayOff.times.includes(time));
        }
        return [];
    }



    // Fetch existing bookings for the date
    const bookings = await Booking.find({ appointmentDate: new Date(date) });

    // Extract booked slots
    const bookedSlots = bookings.map((booking) => booking.serviceStartingTime);

    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return availableSlots;
};





// Create a new booking
// const createBooking = async (bookingData) => {
//     return await Booking.create(bookingData);
// };

// Create a new booking
const createBooking = async (bookingData) => {
    const { appointmentDate, serviceStartingTime } = bookingData;

    // Check if the time slot is already booked
    const existingBooking = await Booking.findOne({
        appointmentDate: new Date(appointmentDate),
        serviceStartingTime,
    });

    if (existingBooking) {
        throw new Error('Time slot is already booked.');
    }

    // Create the booking
    const newBooking = await Booking.create(bookingData);
    return newBooking;
};

// Get all bookings
const getAllBookings = async () => {
        const booking = await Booking.find({})
        .populate('service_ids', 'name description basePrice') // Populate service details
        .populate('assignedTo', 'firstName lastName email')
        .exec();

        if (!booking) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
        }

    return booking;
};

// Get a booking by ID
const getBookingById = async (bookingId) => {
    const booking = await Booking.findById(bookingId)
        .populate('service_ids', 'name description basePrice') // Populate service details
        .populate('assignedTo', 'firstName lastName email') 
        .exec();
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    
    
    const services = booking.service_ids; // Assuming service_ids are populated
    const totalPrice = calculateTotalPrice(services);
    
    console.log(totalPrice); // Log the total price
    booking.totalPrice = totalPrice; // Update the booking's total price
    return booking;
};

// Update a booking by ID
const updateBookingById = async (bookingId, updateData) => {
    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    return booking;
};

// Delete a booking by ID
const deleteBookingById = async (bookingId) => {
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    return booking;
};

//assign staff to a booking 
const assignUserToBooking = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    booking.assignedTo = userId;
    await booking.save();

    return booking;
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById,
    assignUserToBooking,
    getAvailableSlots,
};
