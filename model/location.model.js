const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Downtown Branch"
    address: { type: String, required: true },
    coordinates: { 
        lat: { type: Number, required: true }, 
        lng: { type: Number, required: true } 
    },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;