const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    duration: { type: Number, required: true }, // Example: 2
    image: { type: String },
    additionalServices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AddOnService', // Reference to AddOnService schema
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