const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true }, // English name
        am: { type: String, required: true }, // Amharic name
    },
    description: {
        en: { type: String, required: true }, // English description
        am: { type: String, required: true }, // Amharic description
    },
    pricing: {
        SUV: {
            basePrice: { type: Number}, // Base price for SUV
            maxPrice: { type: Number},  // Max price for SUV
        },
        AUTO: {
            basePrice: { type: Number}, // Base price for AUTO
            maxPrice: { type: Number},  // Max price for AUTO
        },
    },
    duration: {
        SUV: { type: Number}, // Duration for SUV (in hours)
        AUTO: { type: Number}, // Duration for AUTO (in hours)
    },
    image: { type: String },
    additionalServices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AddOnService', // Reference to AddOnService schema
        },
    ],
    features: {
        en: [{ type: String }], // Features in English
        am: [{ type: String }], // Features in Amharic
    },
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
