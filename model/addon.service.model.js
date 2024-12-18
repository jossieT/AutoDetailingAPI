const mongoose = require('mongoose');

const addOnServiceSchema = new mongoose.Schema({
    optionName: { type: String, required: true }, // e.g., "Extra Wax Coating"
    additionalPrice: { type: Number, required: true }, // Price for this add-on
    features: [{ type: String }], // Additional features
    description: { type: String }, // Description of the add-on
    duration: { type: Number, required: true }, // Duration in minutes
    available: { type: Boolean, default: true }, // Whether the add-on is active
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const AddOnService = mongoose.model('AddOnService', addOnServiceSchema);

module.exports = AddOnService;