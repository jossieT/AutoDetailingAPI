const mongoose = require('mongoose');
const { parseAMPM, formatAMPM } = require('../helpers/time.formatter');

const bookingSchema = new mongoose.Schema({
    clientDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
    },
    vehicleDetails: {
        carType: { type: String, enum: ['SUV', 'AUTO'], default: 'SUV', required: true, trim: true },
        make: { type: String },
        model: { type: String },
        year: { type: Number },
    },
    images: [{
        url: { type: String, required: false },
        description: { type: String }
    }],
    location: {
        address: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
    },
    service_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        }
    ],
    selectedAddOns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AddOnService',
        },
    ],
    appointmentDate: { type: Date, required: true },
    serviceStartingTime: { type: String, required: true },
    bookingEndTime: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Canceled'],
        default: 'Pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    appointmentNote: {
        type: String,
    },
    totalPrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook 1: Calculate total price
bookingSchema.pre('save', async function (next) {
    if (this.service_ids && this.isModified('service_ids')) {
        await this.populate('service_ids', 'pricing duration');

        this.totalPrice = this.service_ids.reduce((total, service) => {
            const servicePrice = service.pricing;
            return total + servicePrice.basePrice;
        }, 0);
    }

    if (this.selectedAddOns && this.isModified('selectedAddOns')) {
        await this.populate('selectedAddOns', 'additionalPrice');

        const addOnPrice = this.selectedAddOns.reduce((total, addOn) => {
            const priceForCar = addOn.additionalPrice;
            return total + priceForCar.minBasePrice;
        }, 0);

        this.totalPrice += addOnPrice;
    }

    next();
});

// Pre-save hook 2: Calculate bookingEndTime
bookingSchema.pre('save', async function (next) {
    if (this.serviceStartingTime && (this.service_ids || this.selectedAddOns) && this.isModified('serviceStartingTime')) {

        await this.populate('service_ids', 'duration blocksSlots name');
        await this.populate('selectedAddOns', 'duration optionName');

        if (!this.vehicleDetails || !this.vehicleDetails.carType) {
            throw new Error('Vehicle type (SUV or AUTO) must be specified to calculate booking duration.');
        }

        // Skip duration calculation for exception bookings
        const isExceptionBooking = this.service_ids.some(s => s.blocksSlots === false);
        if (isExceptionBooking) {
            console.log('Exception booking: skipping bookingEndTime calculation in pre-save hook');
            return next();
        }

        const vehicleType = this.vehicleDetails.carType;
        const bookingStart = parseAMPM(this.serviceStartingTime);

        const serviceDuration = this.service_ids.reduce((total, service) => {
            if (!service.duration || !service.duration[vehicleType]) {
                throw new Error(`Service ${service.name} does not have a duration defined for ${vehicleType}.`);
            }
            return total + service.duration[vehicleType];
        }, 0);

        const addOnDuration = this.selectedAddOns
            ? this.selectedAddOns.reduce((total, addOn) => {
                if (!addOn.duration) {
                    throw new Error(`Add-on ${addOn.optionName} does not have a duration defined.`);
                }
                return total + addOn.duration;
            }, 0)
            : 0;

        const totalDuration = serviceDuration + addOnDuration + 60; // 60 min buffer
        const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);
        this.bookingEndTime = formatAMPM(bookingEnd);
    }

    next();
});

// Pre-save hook 3: Update updatedAt
bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Pre-save hook 4: Auto-assign staff if not assigned
bookingSchema.pre('save', async function (next) {
    // Skip auto-assignment for exception bookings
    await this.populate('service_ids', 'blocksSlots');
    const isExceptionBooking = this.service_ids.some(s => s.blocksSlots === false);
    if (isExceptionBooking) {
        console.log('Exception booking: skipping auto staff assignment');
        return next();
    }

    if (!this.assignedTo) {
        const availableStaff = await mongoose.model('User').findOne({
            role: 'staff',
            'workingHours.date': this.appointmentDate,
            'workingHours.dayOff': false
        });

        if (availableStaff) {
            this.assignedTo = availableStaff._id;
        } else {
            const admin = await mongoose.model('User').findOne({ role: 'admin' });
            if (admin) {
                this.assignedTo = admin._id;
                console.warn('Assigned booking to admin as fallback');
            }
        }
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;