const Booking = require('../model/booking.model');
const User = require('../model/user.model');
const DayOff = require('../model/day-off.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');
const { parseAMPM, formatAMPM } = require('../helpers/time.formatter');
const Service = require('../model/service.model');


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
        const hours = current.getHours();
        const minutes = current.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes} ${period}`;
        slots.push(formattedTime);
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
};

const initializeWorkingHours = async (date) => {
    const existing = await WorkingHours.findOne({ date: new Date(date) });

    if (!existing) {
        const timeSlots = generateTimeSlots('06:00', '17:00', 30); // Default 30-min intervals
        const workingHours = new WorkingHours({
            date: new Date(date),
            availableSlots: timeSlots,
            unavailableSlots: [],
            dayOff: false,
            partialDayOff: [],
        });
        await workingHours.save();
    }
};

const getAvailableSlots = async (date) => {
    const workingHours = await WorkingHours.findOne({ date: new Date(date) });

    if (!workingHours) {
        await initializeWorkingHours(date);
        return generateTimeSlots('06:00', '17:00', 30);
    }

    if (workingHours.dayOff) {
        return []; // Full day off
    }

    const filteredSlots = workingHours.availableSlots.filter(
        (slot) =>
            !workingHours.unavailableSlots.includes(slot) &&
            !workingHours.partialDayOff.includes(slot)
    );

    return filteredSlots;
};



// Create a new booking
const createBooking = async (bookingData) => {
    const { appointmentDate, serviceStartingTime, vehicleDetails, service_ids} = bookingData;

    // Validate required fields
    if (!vehicleDetails || !vehicleDetails.carType) {
        throw new Error('Vehicle type (SUV or AUTO) must be specified for booking.');
    }
    if (!service_ids || service_ids.length === 0) {
        throw new Error('At least one service must be selected.');
    }

    const workingHours = await WorkingHours.findOne({ date: new Date(appointmentDate) });
    if (!workingHours) throw new Error('Working hours not initialized for the selected date.');

    if (workingHours.dayOff) throw new Error('No bookings allowed on a full day off.');


    if (workingHours.partialDayOff.includes(serviceStartingTime)) {
        throw new Error('Selected time slot falls within a partial day-off.');
    }

    // Check slot availability
    if (!workingHours.availableSlots.includes(serviceStartingTime)) {
        throw new Error('Selected time slot is not available.');
    }

    // Calculate bookingEndTime based on selected services and vehicle type
    const bookingStart = parseAMPM(serviceStartingTime);

    // Populate service details to calculate the duration
    const services = await Service.find({ _id: { $in: service_ids } }, 'duration');
    const totalDuration = services.reduce((total, service) => {
        if (!service.duration || !service.duration[vehicleDetails.carType]) {
            throw new Error(`Service ${service.name} does not have a duration for ${vehicleDetails.carType}.`);
        }
        return total + service.duration[vehicleDetails.carType];
    }, 0);
    // Generate the time range to block (serviceStartingTime to bookingEndTime + 1 hour)
    const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);
    const extendedEnd = new Date(bookingEnd.getTime() + 1 * 60 * 60 * 1000);

    // Generate time slots to block
    const slotsToBlock = [];
    for (let time = new Date(bookingStart); time <= extendedEnd; time.setMinutes(time.getMinutes() + 30)) {
        slotsToBlock.push(formatAMPM(new Date(time)));
    }

    // Validate slot availability
    const isAvailable = slotsToBlock.every(
        (slot) => workingHours.availableSlots.includes(slot) && !workingHours.unavailableSlots.includes(slot)
    );
    if (!isAvailable) throw new Error('One or more requested slots are unavailable.');


    if (!workingHours.availableSlots.includes(serviceStartingTime)) {
        throw new Error('Selected time slot is not available.');
    }
    // Find a staff member
    const defaultStaff = await User.findOne({ role: 'staff' });
    if (!defaultStaff) throw new Error('No staff available for assignment');


    // Mark the slot as unavailable
    // Update unavailable and available slots
    workingHours.unavailableSlots.push(...slotsToBlock);
    workingHours.unavailableSlots = [...new Set(workingHours.unavailableSlots)]; // Remove duplicates

    workingHours.availableSlots = workingHours.availableSlots.filter(
        (slot) => !slotsToBlock.includes(slot)
    );
    await workingHours.save();


    // Assign a staff member to the booking
    bookingData.assignedStaff = defaultStaff._id;

    // Create the booking
    const newBooking = await Booking.create(bookingData);

    // Update the staff's assigned bookings
    defaultStaff.assignedBookings.push(newBooking._id);
    await defaultStaff.save();



    return newBooking;
};

// Get all bookings
const getAllBookings = async () => {
    const booking = await Booking.find({})
        .populate('service_ids', 'name description basePrice') // Populate service details
        .populate('selectedAddOns', 'optionName additionalPrice description') // Populate addOns details
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
