const mongoose = require('mongoose');

const addOnServiceSchema = new mongoose.Schema({
    optionName: {
        en: { type: String, required: true }, // English name
        am: { type: String, required: true }, // Amharic name
    }, // e.g., "Extra Wax Coating"
    additionalPrice: {
        minBasePrice: { type: Number, required: true }, // Minimum base price for the add-on
        maxPrice: { type: Number},     // Maximum price for the add-on
    },
    features: {
        en: [{ type: String }], // Features in English
        am: [{ type: String }], // Features in Amharic
    }, // Additional features
    description: {
        en: { type: String, required: true }, // English description
        am: { type: String, required: true }, // Amharic description
    }, // Description of the add-on
    duration: { type: Number, required: true }, // Duration in minutes
    available: { type: Boolean, default: true }, // Whether the add-on is active
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const AddOnService = mongoose.model('AddOnService', addOnServiceSchema);

module.exports = AddOnService;