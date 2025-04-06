const Booking = require('../model/booking.model');
const User = require('../model/user.model');
const WorkingHours = require('../model/working.hours.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');
const { parseAMPM, formatAMPM } = require('../helpers/time.formatter');
const Service = require('../model/service.model');
const transporter = require('../config/nodemailer');
const { bookingConfirmationTemplate, staffNotificationTemplate, bookingCancellationTemplate, bookingApprovalTemplate, bookingCompletedTemplate } = require('../utils/emailTemplates');
const AddOnService = require('../model/addon.service.model');
const DeletedBooking = require('../model/deleted-booking.model');

process.on('unhandledRejection', (reason, promise) => {
    if (reason.code === 11000) {
        console.log('Duplicate key error handled globally:', reason.message);
    } else {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    }
});

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
    const bookingDate = new Date(date);
    
    // Initialize global working hours first
    await WorkingHours.findOneAndUpdate(
        { date: bookingDate, staff: { $exists: false } },
        {
            $setOnInsert: {
                availableSlots: [],
                unavailableSlots: [],
                dayOff: false
            }
        },
        { upsert: true, new: true }
    );

    // Then initialize staff working hours
    const allStaff = await User.find({ role: 'staff' });

    console.log(`Found ${allStaff.length} staff members to initialize working hours for ${date}`);

    await Promise.all(allStaff.map(async (staff) => {
        const staffId = staff._id;
        try {
            const wh = await WorkingHours.findOneAndUpdate(
                { 
                    date: bookingDate,
                    staff: staffId 
                },
                {
                    $setOnInsert: {
                        availableSlots: generateTimeSlots('06:00', '19:00', 30),
                        unavailableSlots: [],
                        dayOff: false
                    }
                },
                { 
                    upsert: true, 
                    new: true 
                }
            );

            console.log(`Successfully ${wh.isNew ? 'initialized' : 'updated'} working hours for staff ${staffId}`);

            if (!staff.workingHours.includes(wh._id)) {
                await User.findByIdAndUpdate(
                    staffId,
                    { $addToSet: { workingHours: wh._id } },
                    { new: true }
                );
                console.log(`Added working hours reference to staff ${staffId} profile`);
            }
        } catch (error) {
            console.error(`Failed to initialize working hours for staff ${staffId}:`);
            console.error(`- Error code: ${error.code || 'N/A'}`);
            console.error(`- Error message: ${error.message}`);
            console.error(`- Stack trace: ${error.stack}`);
            
            if (error.code === 11000) {
                console.log(`- Reason: Working hours already exist for staff ${staffId} on ${date}`);
            } else {
                console.log(`- Reason: Unexpected error during database operation`);
            }
        }
    }));

    console.log(`Completed working hours initialization for ${date}`);
    return true;
};

const getAvailableSlots = async (date) => {
    const bookingDate = new Date(date);
    await initializeWorkingHours(date);

    const [staffWorkingHours, globalWorkingHours] = await Promise.all([
        WorkingHours.find({
            date: bookingDate,
            staff: { $exists: true, $ne: null }
        }).populate('staff'),
        WorkingHours.findOne({ 
            date: bookingDate,
            staff: { $exists: false }
        })
    ]);

    // Log detailed staff availability
    console.log(`\n=== Staff Availability for ${date} ===`);
    staffWorkingHours.forEach(wh => {
        const staffName = wh.staff?.name || `Staff ${wh.staff?._id || 'Unknown'}`;
        console.log(`\nStaff Member: ${staffName}`);
        console.log(`- Day Off: ${wh.dayOff ? 'Yes' : 'No'}`);
        
        if (!wh.dayOff) {
            console.log(`- Available Slots (${wh.availableSlots.length}):`);
            console.log(`  ${wh.availableSlots.join(', ')}`);
            console.log(`- Unavailable Slots (${wh.unavailableSlots.length}):`);
            console.log(`  ${wh.unavailableSlots.join(', ') || 'None'}`);
        }
    });
    console.log('===================================\n');

    // Combine available slots from all staff
    const allAvailableSlots = staffWorkingHours
        .filter(wh => !wh.dayOff)
        .flatMap(wh => 
            wh.availableSlots.filter(slot => 
                !globalWorkingHours?.unavailableSlots.includes(slot)
            )
        );

    // Get unique slots that appear in at least one staff's availability
    const uniqueSlots = [...new Set(allAvailableSlots)];

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

        const startBoundary = timeToMinutes('06:00 AM');
        const endBoundary = timeToMinutes('04:30 PM');

        const filtered = slots.filter((slot) => {
            const slotInMinutes = timeToMinutes(slot);
            return slotInMinutes >= startBoundary && slotInMinutes <= endBoundary;
        });

        // Sort slots in ascending order
        return filtered.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    };

    return filterSlots(uniqueSlots);
};

const getAvailableStaff = async (date, validationSlots) => {
    const bookingDate = new Date(date);
    
    console.log(`\n=== [${new Date().toISOString()}] Staff Availability Check ===`);
    console.log(`Requested Date: ${date}`);
    console.log(`Required Time Slots (${validationSlots.length}):`, validationSlots.join(', '));

    const allStaff = await User.find({ role: 'staff' })
        .populate({
            path: 'workingHours',
            match: { date: bookingDate }
        })
        .populate('assignedBookings');

    console.log(`Evaluating ${allStaff.length} staff members:`);

    const availableStaff = allStaff.filter(staff => {
        console.log(`\n--- Staff ${staff._id} ---`);
        
        const wh = staff.workingHours.find(w => 
            w.date.getTime() === bookingDate.getTime()
        );
        
        // 1. Basic Availability Check
        if (!wh) {
            console.log('❌ Excluded - No working hours record for this date');
            return false;
        }
        if (wh.dayOff) {
            console.log('❌ Excluded - Marked as day off');
            return false;
        }

        // Enhanced slot availability check
        const hasAllSlots = validationSlots.every(slot => 
            wh.availableSlots.includes(slot) && 
            !wh.unavailableSlots.includes(slot)
        );

        if (!hasAllSlots) {
            const missing = validationSlots.filter(s => 
                !wh.availableSlots.includes(s) || 
                wh.unavailableSlots.includes(s)
            );
            console.log(`Missing slots: ${missing.join(', ')}`);
            return false;
        }

        // 3. Booking Conflict Detection
        const conflicts = staff.assignedBookings.filter(booking => {
            const bookingStart = parseAMPM(booking.serviceStartingTime);
            const bookingEnd = new Date(bookingStart.getTime() + booking.totalDuration * 60000);
            const newStart = parseAMPM(validationSlots[0]);
            const newEnd = parseAMPM(validationSlots[validationSlots.length - 1]);
            
            return (newStart < bookingEnd && newEnd > bookingStart);
        });

        if (conflicts.length > 0) {
            console.log(`❌ Time conflicts with ${conflicts.length} existing bookings:`);
            conflicts.forEach(c => console.log(`   - ${c.serviceStartingTime} (ID: ${c._id})`));
            return false;
        }

        console.log('✅ Meets all availability requirements');
        return true;
    });

    console.log('\n=== Availability Summary ===');
    console.log(`Eligible Staff: ${availableStaff.length}`);
    availableStaff.forEach(s => console.log(`- ${s._id}`));
    
    return availableStaff;
};

const selectStaffMember = async (availableStaff) => {
    console.log(`\n=== [${new Date().toISOString()}] Staff Selection Process ===`);
    
    if (availableStaff.length === 0) {
        console.log('⚠️ No eligible staff found');
        return null;
    }

    console.log('Candidate Staff:');
    availableStaff.forEach(staff => {
        console.log(`- ${staff._id}`);
        console.log(`  Rotation Index: ${staff.lastAssignedIndex}`);
        console.log(`  Last Assigned: ${staff.lastAssignedAt || 'Never'}`);
    });

    // Daily rotation reset at midnight
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 1) {
        console.log('🔄 Resetting daily rotation indexes');
        await User.updateMany({ role: 'staff' }, { $set: { lastAssignedIndex: 0 } });
    }

    // Sort by rotation index and assignment time
    const sortedStaff = availableStaff.sort((a, b) => {
        const indexDiff = a.lastAssignedIndex - b.lastAssignedIndex;
        if (indexDiff !== 0) return indexDiff;
        return a.lastAssignedAt - b.lastAssignedAt;
    });

    console.log('\nSorted Candidates:');
    sortedStaff.forEach((staff, index) => {
        console.log(`${index + 1}. ${staff._id}`);
        console.log(`   Rotation Index: ${staff.lastAssignedIndex}`);
        console.log(`   Last Assignment: ${staff.lastAssignedAt || 'Never'}`);
    });

    const selectedStaff = sortedStaff[0];
    console.log(`\n🎯 Selected Staff: ${selectedStaff._id}`);
    console.log(`   Reason: ${sortedStaff.length > 1 ? 
        'Lowest rotation index and earliest last assignment' : 
        'Only available staff'}`);
    
    // Update rotation index
    const newIndex = selectedStaff.lastAssignedIndex + 1;
    await User.findByIdAndUpdate(selectedStaff._id, {
        $inc: { lastAssignedIndex: 1 },
        $set: { lastAssignedAt: new Date() }
    });
    console.log(`🆕 Updated rotation index: ${selectedStaff.lastAssignedIndex} → ${newIndex}`);

    return selectedStaff;
};

// Create a new bookings
const createBooking = async (bookingData) => {
    try {
        // Ensure working hours are initialized for booking date
        await initializeWorkingHours(bookingData.appointmentDate);

        const { appointmentDate, serviceStartingTime, vehicleDetails, service_ids, selectedAddOns } = bookingData;

        const workingHours = await WorkingHours.findOne({ date: new Date(appointmentDate) });

        if (!workingHours) throw new ApiError(httpStatus.NOT_FOUND, 'Working hours not initialized for the selected date.');

        if (workingHours.dayOff) throw new ApiError(httpStatus.BAD_REQUEST, 'No bookings allowed on a full day off.');

        if (workingHours.partialDayOff.includes(serviceStartingTime)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Selected time slot falls within a partial day-off.');
        }

        // Calculate bookingEndTime based on selected services and vehicle type
        const bookingStart = parseAMPM(serviceStartingTime);

        // Populate service details to calculate the duration
        const services = await Service.find({ _id: { $in: service_ids } }, 'duration');
        const addOns = await AddOnService.find({ _id: { $in: bookingData.selectedAddOns } }, 'duration');

        let totalDuration = 0;
        const serviceDuration = services.reduce((total, service) => {
            if (!service.duration || !service.duration[vehicleDetails.carType]) {
                throw new ApiError(httpStatus.BAD_REQUEST, `Service ${service.name} does not have a duration for ${bookingData.vehicleDetails.carType}.`);
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

        // Generate slotsToBlock before validation
        const validationSlots = [];
        let validationCurrentTime = new Date(bookingStart);
        while (validationCurrentTime < bookingEnd) {
            validationSlots.push(formatAMPM(validationCurrentTime));
            validationCurrentTime.setMinutes(validationCurrentTime.getMinutes() + 30);
        }

        // Then validate slot availability
        // const isAvailable = validationSlots.every(
        //     (slot) => workingHours.availableSlots.includes(slot) && !workingHours.unavailableSlots.includes(slot)
        // );
        // if (!isAvailable) {
        //     throw new ApiError(
        //         httpStatus.BAD_REQUEST,
        //         'The selected time duration requires more consecutive availability than currently available. ' +
        //         'Please choose either:\n' +
        //         '1. A shorter service duration\n' +
        //         '2. A different time slot with sufficient availability\n' +
        //         '3. Another date with more open time slots'
        //     );
        // }

        // After slot validation
        console.log('Validating staff availability for slots:', validationSlots);
        const availableStaff = await getAvailableStaff(bookingData.appointmentDate, validationSlots);
        
        if (availableStaff.length === 0) {
            // Detailed conflict analysis
            const conflictCheckStaff = await User.find({ role: 'staff' })
                .populate('workingHours')
                .populate('assignedBookings');

            console.log('\n=== Conflict Analysis ===');
            let conflictMessages = [];
            
            conflictCheckStaff.forEach(staff => {
                const wh = staff.workingHours.find(w => 
                    w.date.getTime() === new Date(bookingData.appointmentDate).getTime()
                );
                
                if (!wh || wh.dayOff) {
                    conflictMessages.push(`Staff ${staff._id}: Unavailable (${wh ? 'day off' : 'no working hours'})`);
                    return;
                }

                const availableSlots = wh.availableSlots.filter(s => 
                    !wh.unavailableSlots.includes(s)
                );
                const overlap = validationSlots.filter(s => availableSlots.includes(s));
                
                if (overlap.length === 0) {
                    conflictMessages.push(`Staff ${staff._id}: No overlapping slots available`);
                } else {
                    conflictMessages.push(
                        `Staff ${staff._id}: Only ${overlap.length}/${validationSlots.length} slots available ` +
                        `(${overlap.join(', ')})`
                    );
                }
            });

            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'No available staff for the selected time period. Reasons:\n' +
                conflictMessages.join('\n') + '\n\n' +
                'Please try:\n' +
                '1. A shorter service duration\n' +
                '2. A different time slot\n' +
                '3. Another date'
            );
        }

        const selectedStaff = await selectStaffMember(availableStaff);
        
        if (!selectedStaff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'No available staff for the selected time slot');
        }

        // Assign to selected staff user
        bookingData.assignedTo = selectedStaff._id;

        // Get staff working hours
        const staffWorkingHours = await WorkingHours.findOne({
            date: new Date(bookingData.appointmentDate),
            staff: selectedStaff._id
        });

        // Add error handling for missing working hours
        if (!staffWorkingHours) {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                `Staff ${selectedStaff.name} has no working hours initialized for ${bookingData.appointmentDate}`
            );
        }

        // Validate slot availability
        if (!staffWorkingHours.availableSlots.includes(serviceStartingTime)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Selected time slot ${serviceStartingTime} is not available for ${selectedStaff.name}`
            );
        }

        // Create the booking first
        const newBooking = await Booking.create(bookingData);

        // Calculate slotsToBlock using the model-generated end time
        const startTime = parseAMPM(newBooking.serviceStartingTime);
        const endTime = parseAMPM(newBooking.bookingEndTime);
        const slotsToBlock = [];
        
        let currentTime = new Date(startTime);
        while (currentTime < endTime) { // Use <= to include end time
            slotsToBlock.push(formatAMPM(currentTime));
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        // Block slots atomically
        const updatedAvailable = staffWorkingHours.availableSlots.filter(s => 
            !slotsToBlock.includes(s)
        );
        const updatedUnavailable = [...new Set([...staffWorkingHours.unavailableSlots, ...slotsToBlock])];
        
        await WorkingHours.findByIdAndUpdate(staffWorkingHours._id, {
            $set: {
                availableSlots: updatedAvailable,
                unavailableSlots: updatedUnavailable
            }
        });

        // Update global availability
        await Promise.all(slotsToBlock.map(slot =>
            updateGlobalAvailability(bookingData.appointmentDate, slot)
        ));

        // Update user's assigned bookings
        await User.findByIdAndUpdate(selectedStaff._id, {
            $push: { assignedBookings: newBooking._id }
        });

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
            to: selectedStaff.email,
            subject: 'New Booking Assigned',
            html: staffNotificationTemplate(newBooking, selectedStaff, serviceInfo, calculatedBookingEndTime, addOnInfo),
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

        // Call this after successful booking creation
        await updateGlobalAvailability(bookingData.appointmentDate, bookingData.serviceStartingTime);

        console.log(`Assigned booking to staff ${selectedStaff._id}`);
        console.log('Current staff assignments:', {
            staff1: {
                id: availableStaff[0]._id,
                bookings: availableStaff[0].assignedBookings.length,
                index: availableStaff[0].lastAssignedIndex
            },
            staff2: availableStaff[1] ? {
                id: availableStaff[1]._id,
                bookings: availableStaff[1].assignedBookings.length,
                index: availableStaff[1].lastAssignedIndex
            } : null
        });

        return newBooking;
    } catch (error) {
        console.error('Booking Failed:', error.message);
        throw error;
    }
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
        .populate('assignedTo', 'name phone email')
        .populate('selectedAddOns', 'optionName additionalPrice description')
        .exec();
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    //console.log(booking.images[0].url);

    const services = booking.service_ids; // Assuming service_ids are populated
    const totalPrice = calculateTotalPrice(services);

    //console.log(totalPrice); // Log the total price
    booking.totalPrice = totalPrice; // Update the booking's total price
    return booking;
};

// Update a booking by ID
const updateBookingById = async (bookingId, updateData) => {
    // First check if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    
    // If updating appointment date or time, validate availability
    if (updateData.appointmentDate || updateData.serviceStartingTime) {
        const date = updateData.appointmentDate || booking.appointmentDate;
        const time = updateData.serviceStartingTime || booking.serviceStartingTime;

        const workingHours = await WorkingHours.findOne({ date: new Date(date) });
        if (!workingHours) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Working hours not initialized for the selected date');
        }

        if (workingHours.dayOff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Selected date is a day off');
        }

        // Only check availability if the time is different from the current booking
        if (time !== booking.serviceStartingTime) {
            if (!workingHours.availableSlots.includes(time)) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Selected time slot is not available');
            }
        }
    }

    // Update the booking with the new data
    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('service_ids selectedAddOns assignedTo');

    if (!updatedBooking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    return updatedBooking;
};

// Delete a booking by ID
const deleteBookingById = async (bookingId) => {
    // Find the booking to archive
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    try {
        // Archive the booking before deletion
        const deletedBooking = new DeletedBooking({
            originalId: booking._id,
            deletedAt: new Date(),
            bookingData: booking.toObject()
        });
        await deletedBooking.save();
    } catch (archiveError) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to archive booking before deletion'
        );
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

    return { message: 'Booking deleted and archived successfully' };
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

    if(booking.status === 'Confirmed') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already approved.');
    }

    if(booking.status === 'Completed') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Completed Bookings cannot be changed.');
    }
    if(booking.status === 'Canceled') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Canceled Bookings cannot be approved.');
    }

    booking.status = 'Confirmed';
    await booking.save();

    const serviceInfo = await Service.find({ _id: { $in: booking.service_ids } });
   
    const addOnInfo = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }).lean();
    //const calculatedBookingEndTime = formatAMPM(bookingEnd);
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

    if(booking.status === 'Canceled') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already canceled.');
    }

    if(booking.status === 'Completed') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Completed Bookings cannot be changed.');
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

    if(booking.status === 'Completed') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already marked as completed.');
    }

    if(booking.status === 'Pending') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is not yet confirmed.');
    }

    if(booking.status === 'Canceled') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Canceled Bookings cannot be changed to completed.');
    }


    booking.status = 'Completed';
    await booking.save();

    const serviceInfo = await Service.find({ _id: { $in: booking.service_ids } });
    //const addOnInfo = await AddOnService.find({ _id: { $in: booking.selectedAddOns } }).lean();

    // Send email notification to client
    const clientEmailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.clientDetails.email,
        subject: 'Thank You for Choosing Swift Addis Mobile Car Detailing!',
        html: bookingCompletedTemplate(booking, serviceInfo),
    };

    try {
        await transporter.sendMail(clientEmailOptions);
        console.log('Client email sent successfully');
    } catch (error) {
        console.error('Failed to send client email:', error);
    }

    return booking;
};

const getDeletedBookings = async () => {
    const deletedBookings = await DeletedBooking.find({})
        .sort({ deletedAt: -1 }); // Sort by deletion date, most recent first
    
    if (!deletedBookings || deletedBookings.length === 0) {
        return [];
    }

    return deletedBookings;
};

const rotateStaffAssignment = async () => {
    // Reset rotation index daily for staff users
    await User.updateMany(
        { role: 'staff' }, 
        { $set: { lastAssignedIndex: 0 } }
    );
};

const updateGlobalAvailability = async (date, timeSlot) => {
    const bookingDate = new Date(date);
    const allStaffHours = await WorkingHours.find({
        date: bookingDate,
        staff: { $exists: true }
    });

    // Consider only staff not on day off
    const availableStaffHours = allStaffHours.filter(wh => !wh.dayOff);
    
    // If no staff available, mark slot as unavailable
    if (availableStaffHours.length === 0) {
        await WorkingHours.updateOne(
            { date: bookingDate, staff: { $exists: false } },
            { $addToSet: { unavailableSlots: timeSlot } },
            { upsert: true }
        );
        return;
    }

    // Check if all available staff have slot blocked
    const allBooked = availableStaffHours.every(wh => 
        wh.unavailableSlots.includes(timeSlot)
    );

    if (allBooked) {
        await WorkingHours.updateOne(
            { date: bookingDate, staff: { $exists: false } },
            { $addToSet: { unavailableSlots: timeSlot } },
            { upsert: true }
        );
    } else {
        await WorkingHours.updateOne(
            { date: bookingDate, staff: { $exists: false } },
            { $pull: { unavailableSlots: timeSlot } }
        );
    }
};

const getWorkingHoursBreakdown = async (date) => {
    const bookingDate = new Date(date);
    
    // Ensure working hours are initialized first
    await initializeWorkingHours(date);

    const [global, staffHours] = await Promise.all([
        WorkingHours.findOne({ 
            date: bookingDate,
            staff: { $exists: false }
        }),
        WorkingHours.find({
            date: bookingDate,
            staff: { $exists: true }
        }).populate('staff', 'name _id').lean()
    ]);

    // Reuse existing availability calculation logic
    const globalAvailableSlots = await getAvailableSlots(date);

    return {
        global: {
            date: bookingDate,
            availableSlots: globalAvailableSlots,
            unavailableSlots: global?.unavailableSlots || [],
            dayOff: global?.dayOff || false
        },
        staff: staffHours
            .filter(h => h.staff)
            .map(h => ({
                staffId: h.staff?._id || 'unknown-staff-id',
                staffName: h.staff?.name || 'Unknown Staff',
                available: h.availableSlots,
                unavailable: h.unavailableSlots,
                dayOff: h.dayOff
            }))
    };
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
    markAsCompleted,
    getDeletedBookings,
    getWorkingHoursBreakdown
};
