const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    clientDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    vehicleDetails: {
        type: { type: String, required: true }, // e.g., "Sedan", "SUV", etc.
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
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
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
        required: false,
    },
    totalPrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to calculate the total price before saving
bookingSchema.pre('save', async function (next) {
    if (this.service_ids && this.isModified('service_ids')) {
        // Populate service_ids to fetch service details
        await this.populate('service_ids', 'basePrice duration');

        // Calculate total price
        this.totalPrice = this.service_ids.reduce((total, service) => {
            console.log(total + service.basePrice);

            return total + service.basePrice;
        }, 0);

        // Calculate total duration
        const totalDuration = this.service_ids.reduce((total, service) => {
            console.log(service);
            return total + service.duration; // Assuming `duration` is in minutes
        }, 0);

        // Calculate booking end time
        const [startHours, startMinutes] = this.serviceStartingTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(startHours);
        endTime.setMinutes(startMinutes + totalDuration);

        // Format the booking end time as HH:mm
        const endHours = endTime.getHours().toString().padStart(2, '0');
        const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
        console.log(`${endHours}:${endMinutes}`);

        this.bookingEndTime = `${endHours}:${endMinutes}`;
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