const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    imageUrl: { type: String },
    description: {
        en: { type: String }, // English description
        am: { type: String }, // Amharic description
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field automatically before saving
gallerySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Gallery', gallerySchema);