const Booking = require('../model/booking.model');
const User = require('../model/user.model');
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
    let current = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (current < end) {
        slots.push(current.toTimeString().slice(0, 5)); // Format as "HH:mm"
        current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
    }

    return slots;
};

const isSlotAvailable = async (date, serviceStartingTime) => {
    // Fetch working hours
    const workingHours = await WorkingHours.findOne();

    if (!workingHours) {
        throw new Error('Working hours are not configured');
    }

    const { startTime, endTime, intervalMinutes } = workingHours;

    // Generate all time slots
    const allSlots = generateTimeSlots(startTime, endTime, intervalMinutes);

    // Check if the date is a day off
    const dayOff = await DayOff.findOne({ date });

    if (dayOff) {
        if (dayOff.times && dayOff.times.length > 0) {
            // Exclude specific times from working hours
            const availableSlots = allSlots.filter(time => !dayOff.times.includes(time));
            if (!availableSlots.includes(serviceStartingTime)) {
                return false; // Slot is unavailable due to day-off
            }
        } else {
            return false; // Entire day is unavailable
        }
    }

    // Fetch existing bookings for the date
    const bookings = await Booking.find({ appointmentDate: new Date(date) });

    // Create a set of unavailable slots based on bookings
    const unavailableSlots = new Set();

    bookings.forEach((booking) => {
        const bookingStart = new Date(`1970-01-01T${booking.serviceStartingTime}:00`);
        const bookingEnd = new Date(`1970-01-01T${booking.bookingEndTime}:00`);
        bookingEnd.setHours(bookingEnd.getHours() + 1); // Add 1-hour buffer

        for (let time = new Date(bookingStart); time < bookingEnd; time.setMinutes(time.getMinutes() + intervalMinutes)) {
            unavailableSlots.add(time.toTimeString().slice(0, 5)); // Format as "HH:mm"
        }
    });

    // Check if the requested time is unavailable
    if (unavailableSlots.has(serviceStartingTime)) {
        return false; // Slot is booked or unavailable
    }

    // Finally, ensure the requested time is within working hours
    return allSlots.includes(serviceStartingTime);
};


// Fetch available slots for a given date
const getAvailableSlots = async (date) => {
    // Fetch working hours
    const workingHours = await WorkingHours.findOne(); // Assuming static working hours

    if (!workingHours) {
        throw new Error('Working hours are not configured');
    }

    const { startTime, endTime, intervalMinutes } = workingHours;

    // Generate all time slots
    const allSlots = generateTimeSlots(startTime, endTime, intervalMinutes);

    // Check if the date is a day off
    const dayOff = await DayOff.findOne({ date });

    if (dayOff) {
        if (dayOff.times && dayOff.times.length > 0) {
            // Exclude specific times for partial day off
            return allSlots.filter((time) => !dayOff.times.includes(time));
        }
        return []; // Entire day is off
    }

    // Fetch existing bookings for the date, sorted by start time
    const bookings = await Booking.find({ appointmentDate: new Date(date) }).sort({
        serviceStartingTime: 1,
    });

    // Create a set of unavailable slots based on bookings
    const unavailableSlots = new Set();

    bookings.forEach((booking) => {
        const bookingStart = new Date(`1970-01-01T${booking.serviceStartingTime}:00`);
        const bookingEnd = new Date(`1970-01-01T${booking.bookingEndTime}:00`);
        bookingEnd.setHours(bookingEnd.getHours() + 1); // Add 1-hour buffer

        // Add all time slots within the unavailable range to the set
        for (let time = new Date(bookingStart); time < bookingEnd; time.setMinutes(time.getMinutes() + intervalMinutes)) {
            unavailableSlots.add(time.toTimeString().slice(0, 5)); // Format as "HH:mm"
        }
    });

    // Filter out unavailable slots from allSlots
    const availableSlots = allSlots.filter((slot) => !unavailableSlots.has(slot));

    return availableSlots;
};



// Create a new booking
const createBooking = async (bookingData) => {
    const { appointmentDate, serviceStartingTime } = bookingData;

    // Find the default staff
    const defaultStaff = await User.findOne({ role: 'staff' });
    // Assign the staff to the booking
    bookingData.assignedStaff = defaultStaff._id;

    if (!defaultStaff) {
        throw new Error('No staff available for assignment');
    }

    // Check if the time slot is already booked
    const existingBooking = await Booking.findOne({
        appointmentDate: new Date(appointmentDate),
        serviceStartingTime,
    });

    if (existingBooking) {
        throw new Error('Time slot is already booked.');
    }

    // Validate if the slot is available
    const isAvailable = await isSlotAvailable(appointmentDate, serviceStartingTime);

    if (!isAvailable) {
        throw new Error('The requested time slot is unavailable.');
    }


    // Create the booking
    const newBooking = await Booking.create(bookingData);
    // await newBooking.save();
    // Add the booking ID to the staff's assignedBookings array
    defaultStaff.assignedBookings.push(newBooking._id);
    await defaultStaff.save();

    return newBooking;
};

// Get all bookings
const getAllBookings = async () => {
    const booking = await Booking.find({})
        .populate('service_ids', 'name description basePrice') // Populate service details
        .populate('assignedTo', 'name email phone -_id')
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
