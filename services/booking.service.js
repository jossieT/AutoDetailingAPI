const Booking = require('../model/booking.model');
const User = require('../model/user.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');
const { parseAMPM, formatAMPM } = require('../helpers/time.formatter');
const Service = require('../model/service.model');
const transporter = require('../config/nodemailer');
const { bookingConfirmationTemplate, staffNotificationTemplate, bookingCancellationTemplate, bookingApprovalTemplate } = require('../utils/emailTemplates');
const AddOnService = require('../model/addon.service.model');
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
        const timeSlots = generateTimeSlots('06:00', '19:00', 30); // Default 30-min intervals
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

    const filterSlots = (slots) => {
        const timeToMinutes = (time) => {
            const [hours, minutesPeriod] = time.split(':');
            const [minutes, period] = minutesPeriod.split(' ');
            const hoursIn24 = period === 'PM' && parseInt(hours) !== 12
                ? parseInt(hours) + 12
                : period === 'AM' && parseInt(hours) === 12
                    ? 0
                    : parseInt(hours);
            return hoursIn24 * 60 + parseInt(minutes);
        };

        const startBoundary = timeToMinutes('06:00 AM'); // Start of range
        const endBoundary = timeToMinutes('04:30 PM');  // End of range

        return slots.filter((slot) => {
            const slotInMinutes = timeToMinutes(slot);
            return slotInMinutes >= startBoundary && slotInMinutes <= endBoundary;
        });
    };



    if (!workingHours) {
        await initializeWorkingHours(date);
        const allSlots = generateTimeSlots('06:00', '19:00', 30);
        return filterSlots(allSlots);
    }

    if (workingHours.dayOff) {
        return []; // Full day off
    }

    const availableSlots = workingHours.availableSlots;

    // console.log(workingHours.unavailableSlots);
    // console.log(workingHours.availableSlots);


    const allSlot = availableSlots.sort((a, b) => {
        const timeToMinutes = (time) => {
            const [hours, minutesPeriod] = time.split(':');
            const [minutes, period] = minutesPeriod.split(' ');
            const hoursIn24 = period === 'PM' && parseInt(hours) !== 12
                ? parseInt(hours) + 12
                : period === 'AM' && parseInt(hours) === 12
                    ? 0
                    : parseInt(hours);
            return hoursIn24 * 60 + parseInt(minutes);
        };

        return timeToMinutes(a) - timeToMinutes(b);
    });



    const filteredSlots = filterSlots(allSlot);

    return filteredSlots;

    // const filterSlotsForDisplay = (slots) => {
    //     const timeToMinutes = (time) => {
    //         const [hours, minutesPeriod] = time.split(':');
    //         const [minutes, period] = minutesPeriod.split(' ');
    //         const hoursIn24 = period === 'PM' && parseInt(hours) !== 12
    //             ? parseInt(hours) + 12
    //             : period === 'AM' && parseInt(hours) === 12
    //                 ? 0
    //                 : parseInt(hours);
    //         return hoursIn24 * 60 + parseInt(minutes);
    //     };



    // }
};



// Create a new booking
const createBooking = async (bookingData) => {
    const { appointmentDate, serviceStartingTime, vehicleDetails, service_ids, selectedAddOns } = bookingData;

    // Validate required fields
    // if (!vehicleDetails || !vehicleDetails.carType) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Vehicle type (SUV or AUTO) must be specified for booking.');
    // }

    // if (!service_ids || service_ids.length === 0) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'At least one service must be selected.');
    // }

    const workingHours = await WorkingHours.findOne({ date: new Date(appointmentDate) });

    if (!workingHours) throw new ApiError(httpStatus.NOT_FOUND, 'Working hours not initialized for the selected date.');

    if (workingHours.dayOff) throw new ApiError(httpStatus.BAD_REQUEST, 'No bookings allowed on a full day off.');

    if (workingHours.partialDayOff.includes(serviceStartingTime)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Selected time slot falls within a partial day-off.');
    }



    //Check slot availabilityavailableSlots
    if (!workingHours.availableSlots.includes(serviceStartingTime)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Selected time slot is not available.');
    }

    // Calculate bookingEndTime based on selected services and vehicle type
    const bookingStart = parseAMPM(serviceStartingTime);

    // Populate service details to calculate the duration
    const services = await Service.find({ _id: { $in: service_ids } }, 'duration');
    const addOns = await AddOnService.find({ _id: { $in: bookingData.selectedAddOns } }, 'duration');

    let totalDuration = 0;
    const serviceDuration = services.reduce((total, service) => {
        if (!service.duration || !service.duration[vehicleDetails.carType]) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${vehicleDetails.carType}.`);
        }
        return total + service.duration[vehicleDetails.carType];
    }, 0);

    totalDuration += serviceDuration;

    const addOnDuration = addOns.reduce((total, addOn) => {
        if (!addOn.duration) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Add-On ${addOn.name} does not have a duration.`);
        }
        return total + addOn.duration;
    }, 0);

    if (selectedAddOns) {
        totalDuration += addOnDuration;
    }



    // Generate the time range to block (serviceStartingTime to bookingEndTime + 1 hour)
    const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);
    const extendedEnd = new Date(bookingEnd.getTime() + 1 * 60 * 60 * 1000);

    // Generate time slots to block
    const slotsToBlock = [];
    for (let time = new Date(bookingStart); time < extendedEnd; time.setMinutes(time.getMinutes() + 30)) {
        slotsToBlock.push(formatAMPM(new Date(time)));
    }
    //slotsToBlock.push(formatAMPM(extendedEnd));
    // Convert working hours to Date objects
    //const workStart = new Date(`1970-01-01T${workingHours.availableSlots[0]}:00`);

    // const workEnd = new Date(`1970-01-01T12:00:00`);
    // console.log(workEnd);
    // console.log(bookingEnd);
    // if (bookingEnd > workEnd) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Booking duration exceeds the end of working hours.');
    // }



    // Generate time slots to check
    // const slotsToCheck = [];
    // let current = bookingStart;
    // while (current < bookingEnd) {
    //     slotsToCheck.push(formatAMPM(current));
    //     current = new Date(current.getTime() + 30 * 60 * 1000); // Increment by 30 minutes
    // }

    // // Ensure all slots are available
    // const isItAvailable = slotsToCheck.every(
    //     (slot) => workingHours.availableSlots.includes(slot) && !workingHours.unavailableSlots.includes(slot)
    // );

    // if (!isItAvailable) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'One or more requested slots are not available.');
    // }

    //Validate slot availability
    const isAvailable = slotsToBlock.every(
        (slot) => workingHours.availableSlots.includes(slot) && !workingHours.unavailableSlots.includes(slot)
    );
    if (!isAvailable) throw new ApiError(httpStatus.BAD_REQUEST, 'One or more requested slots are unavailable.');

    // new imlemented extended to 12 hr PM
    // const isAvailable = slotsToBlock.every(
    //     (slot) => workingHours.availableSlots.includes(slot) || slot >= '12:00 PM'
    // );
    // if (!isAvailable) throw new ApiError(httpStatus.BAD_REQUEST, 'One or more requested slots are unavailable.');


    // Find a staff member
    const defaultStaff = await User.findOne({ role: 'staff' });
    if (!defaultStaff) throw new ApiError(httpStatus.NOT_FOUND, 'No staff available for assignment');

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

    // Fetch service information for email templates
    const serviceInfo = await Service.find({ _id: { $in: service_ids } });
    const addOnInfo = await AddOnService.find({ _id: { $in: bookingData.selectedAddOns } }).lean();
    // Format booking end time
    const calculatedBookingEndTime = formatAMPM(bookingEnd);

    // Send email notifications
    const clientEmailOptions = {
        from: process.env.EMAIL_USER,
        to: bookingData.clientDetails.email,
        subject: ' Booking Received – Pending Confirmation',
        html: bookingConfirmationTemplate(newBooking, serviceInfo, calculatedBookingEndTime, addOnInfo),
    };

    const staffEmailOptions = {
        from: process.env.EMAIL_USER,
        to: defaultStaff.email,
        subject: 'New Booking Assigned',
        html: staffNotificationTemplate(newBooking, defaultStaff, serviceInfo, calculatedBookingEndTime, addOnInfo),
    };

    try {
        await transporter.sendMail(clientEmailOptions);
        console.log('Client email sent successfully');
    } catch (error) {
        console.error('Failed to send client email:', error);
    }

    try {
        await transporter.sendMail(staffEmailOptions);
        console.log('Staff email sent successfully');
    } catch (error) {
        console.error('Failed to send staff email:', error);
    }

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
        .populate('assignedTo', 'name hone email')
        .populate('selectedAddOns', 'optionName additionalPrice description')
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
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Release reserved time slots
    if (booking.appointmentDate && booking.serviceStartingTime && booking.service_ids) {
        const workingHours = await WorkingHours.findOne({ date: new Date(booking.appointmentDate) });
        if (workingHours) {

            const bookingStart = parseAMPM(booking.serviceStartingTime);
            // Calculate total duration (including the extra 1 hour)
            //const services = await Service.find({ _id: { $in: booking.service_ids } });
            const services = await Service.find({ _id: { $in: booking.service_ids } }, 'duration');
            const addOns = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }, 'duration');

            let totalDuration = 0;
            const serviceDuration = services.reduce((total, service) => {
                if (!service.duration || !service.duration[booking.vehicleDetails.carType]) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${booking.vehicleDetails.carType}.`);
                }
                return total + service.duration[booking.vehicleDetails.carType];
            }, 0);

            totalDuration += serviceDuration;

            const addOnDuration = addOns.reduce((total, addOn) => {
                if (!addOn.duration) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `Add-On ${addOn.name} does not have a duration.`);
                }
                return total + addOn.duration;
            }, 0);

            if (booking.selectedAddOns) {
                totalDuration += addOnDuration;
            }





            // const totalDuration = services.reduce((total, service) => {
            //     if (!service.duration || !service.duration[booking.vehicleDetails.carType]) {
            //         throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${booking.vehicleDetails.carType}.`);
            //     }
            //     return total + service.duration[booking.vehicleDetails.carType];
            // }, 0);





            const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);
            const extendedEnd = new Date(bookingEnd.getTime() + 1 * 60 * 60 * 1000);

            // Generate time slots to release
            const slotsToRelease = [];
            for (let time = new Date(bookingStart); time <= extendedEnd; time.setMinutes(time.getMinutes() + 30)) {
                slotsToRelease.push(formatAMPM(new Date(time)));
            }

            // Update working hours: remove slots from unavailableSlots and add back to availableSlots
            workingHours.unavailableSlots = workingHours.unavailableSlots.filter(
                (slot) => !slotsToRelease.includes(slot)
            );
            workingHours.availableSlots = [...workingHours.availableSlots, ...slotsToRelease];

            // Ensure no duplicates in availableSlots
            workingHours.availableSlots = [...new Set(workingHours.availableSlots)];
            await workingHours.save();
        }
    }

    // Remove the booking ID from assigned staff
    if (booking.assignedTo) {
        await User.updateOne(
            { _id: booking.assignedTo },
            { $pull: { assignedBookings: booking._id } }
        );
    }

    // Finally, delete the booking
    await booking.deleteOne();

    return { message: 'Booking deleted successfully, time slots released.' };
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

// Approve a booking
const approveBooking = async (bookingId) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    booking.status = 'Confirmed';
    await booking.save();

    const serviceInfo = await Service.find({ _id: { $in: booking.service_ids } });
    const addOnInfo = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }).lean();

    // Send email notification to client
    const clientEmailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.clientDetails.email,
        subject: 'Your Appointment is Confirmed with Swift Addis Mobile Car Detailing!',
        html: bookingApprovalTemplate(booking, serviceInfo, addOnInfo),
    };

    try {
        await transporter.sendMail(clientEmailOptions);
        console.log('Client email sent successfully');
    } catch (error) {
        console.error('Failed to send client email:', error);
    }

    return booking;
};

// Cancel a booking
const cancelBooking = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    booking.status = 'Canceled';
    await booking.save();

    // Release reserved time slots
    if (booking.appointmentDate && booking.serviceStartingTime && booking.service_ids) {
        const workingHours = await WorkingHours.findOne({ date: new Date(booking.appointmentDate) });
        if (workingHours) {

            const bookingStart = parseAMPM(booking.serviceStartingTime);
            // Calculate total duration (including the extra 1 hour)
            //const services = await Service.find({ _id: { $in: booking.service_ids } });
            const services = await Service.find({ _id: { $in: booking.service_ids } }, 'duration');
            const addOns = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }, 'duration');

            let totalDuration = 0;
            const serviceDuration = services.reduce((total, service) => {
                if (!service.duration || !service.duration[booking.vehicleDetails.carType]) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${booking.vehicleDetails.carType}.`);
                }
                return total + service.duration[booking.vehicleDetails.carType];
            }, 0);

            totalDuration += serviceDuration;

            const addOnDuration = addOns.reduce((total, addOn) => {
                if (!addOn.duration) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `Add-On ${addOn.name} does not have a duration.`);
                }
                return total + addOn.duration;
            }, 0);

            if (booking.selectedAddOns) {
                totalDuration += addOnDuration;
            }





            // const totalDuration = services.reduce((total, service) => {
            //     if (!service.duration || !service.duration[booking.vehicleDetails.carType]) {
            //         throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${booking.vehicleDetails.carType}.`);
            //     }
            //     return total + service.duration[booking.vehicleDetails.carType];
            // }, 0);





            const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);
            const extendedEnd = new Date(bookingEnd.getTime() + 1 * 60 * 60 * 1000);

            // Generate time slots to release
            const slotsToRelease = [];
            for (let time = new Date(bookingStart); time <= extendedEnd; time.setMinutes(time.getMinutes() + 30)) {
                slotsToRelease.push(formatAMPM(new Date(time)));
            }

            // Update working hours: remove slots from unavailableSlots and add back to availableSlots
            workingHours.unavailableSlots = workingHours.unavailableSlots.filter(
                (slot) => !slotsToRelease.includes(slot)
            );
            workingHours.availableSlots = [...workingHours.availableSlots, ...slotsToRelease];

            // Ensure no duplicates in availableSlots
            workingHours.availableSlots = [...new Set(workingHours.availableSlots)];
            await workingHours.save();
        }
    }

    const serviceInfo = await Service.find({ _id: { $in: booking.service_ids } });
    const addOnInfo = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }).lean();

    // Send email notification to client
    const clientEmailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.clientDetails.email,
        subject: ' Update Regarding Your Booking Request with Swift Addis',
        html: bookingCancellationTemplate(booking, serviceInfo, addOnInfo),
    };

    try {
        await transporter.sendMail(clientEmailOptions);
        console.log('Client email sent successfully');
    } catch (error) {
        console.error('Failed to send client email:', error);
    }

    return booking;
};

const markAsCompleted = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    booking.status = 'Completed';
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
    approveBooking,
    cancelBooking,
    markAsCompleted
};
