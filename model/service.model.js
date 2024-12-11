const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    duration: { type: Number, required: true }, // Example: 2
    image: { type: String },
    customizableOptions: [
        {
        optionName: { type: String, required: true }, // e.g., "Extra Wax Coating"
        additionalPrice: { type: Number, default: 0 }, // Additional price for this customization
        description: { type: String }, // Description of the customization
    },
    ],
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field automatically before saving
serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;