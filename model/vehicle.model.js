const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    make: { type: String, required: true }, // Example: "Toyota"
    model: { type: String, required: true }, // Example: "Camry"
    year: { type: Number, required: true }, // Example: 2020
    license_plate: { type: String, required: true },
    color: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;