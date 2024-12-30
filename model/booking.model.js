const mongoose = require('mongoose');
const { parseAMPM, formatAMPM } = require('../helpers/time.formatter');

const bookingSchema = new mongoose.Schema({
    clientDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String},
    },
    vehicleDetails: {
        carType: { type: String, enum: ['SUV', 'AUTO'], default: 'SUV', required: true, trim: true }, // e.g., "Sedan", "SUV", etc.
        make: { type: String }, // Optional: Vehicle make
        model: { type: String }, // Optional: Vehicle model
        year: { type: Number }, // Optional: Vehicle year
    },
    images: [{
        url: { type: String, required: false }, // URL of uploaded car image
        description: { type: String }          // Optional description
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
            ref: 'AddOnService', // Reference to selected add-ons
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
        ref: 'User', // Assuming staff members are part of the `User` model
    },
    appointmentNote: {
        type: String,
    },
    totalPrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to calculate the total price before saving
bookingSchema.pre('save', async function (next) {
    if (this.service_ids && this.isModified('service_ids')) {
        // Populate service_ids to fetch service details
        await this.populate('service_ids', 'pricing duration');

        if (!this.vehicleDetails.carType) {
            throw new Error('Car type is required to calculate total price');
        }
        // Calculate total price
        this.totalPrice = this.service_ids.reduce((total, service) => {
            const priceForCarType = service.pricing[this.vehicleDetails.carType];
            if (!priceForCarType) {
                throw new Error(`Price not defined for car type: ${this.vehicleDetails.carType}`);
            }
            return total + priceForCarType.basePrice;
        }, 0);
        
    }

    // Check and calculate total for add-ons
    if (this.selectedAddOns && this.isModified('selectedAddOns')) {
        // Populate selectedAddOns to fetch add-on details
        await this.populate('selectedAddOns', 'additionalPrice');

        // Calculate total price for add-ons
        const addOnPrice = this.selectedAddOns.reduce((total, addOn) => {
            const priceForCar = addOn.additionalPrice;
            return total + priceForCar.minBasePrice; // or minBasePrice based on requirement
        }, 0);

        // Add add-on price to the total price
        this.totalPrice += addOnPrice;
    }
    next();
});

bookingSchema.pre('save', async function (next) {
    if (this.serviceStartingTime && (this.service_ids || this.selectedAddOns) && this.isModified('serviceStartingTime')) {
        // Ensure services and selectedAddOns are populated to access their durations
        await this.populate('service_ids', 'duration');
        await this.populate('selectedAddOns', 'duration');

        if (!this.vehicleDetails || !this.vehicleDetails.carType) {
            throw new Error('Vehicle type (SUV or AUTO) must be specified to calculate booking duration.');
        }

        const vehicleType = this.vehicleDetails.carType;

        // Parse the serviceStartingTime to Date object
        let bookingStart = parseAMPM(this.serviceStartingTime);

        // Calculate total duration by summing up durations of selected services
        const serviceDuration  = this.service_ids.reduce((total, service) => {
            if (!service.duration || !service.duration[vehicleType]) {
                throw new Error(`Service ${service.name} does not have a duration defined for ${vehicleType}.`);
            }
            return total + service.duration[vehicleType];
        }, 0);

         // Calculate total duration for add-ons (if any)
         const addOnDuration = this.selectedAddOns
         ? this.selectedAddOns.reduce((total, addOn) => {
               if (!addOn.duration) {
                   throw new Error(`Add-on ${addOn.optionName} does not have a duration defined.`);
               }
               return total + addOn.duration;
           }, 0)
         : 0;


            // Combine service and add-on durations
        const totalDuration = serviceDuration + addOnDuration;
        
        // Add one hour (60 minutes) to the total duration

        // Calculate booking end time
        const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60 * 1000);

        // Store bookingEndTime in AM/PM format
        this.bookingEndTime = formatAMPM(bookingEnd);
    }

    next();
});
// Update the updatedAt field automatically before saving
bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

bookingSchema.pre('save', async function (next) {
    if (!this.assignedTo) { 
        const staff = await mongoose.model('User').findOne({ role: 'staff' }); // Find the single staff user
        if (staff) {
            this.assignedTo = staff._id; // Assign staff ID to assignedTo
        }
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;