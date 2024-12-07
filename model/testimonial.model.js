const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: { type: String, required: true }, // As no registration exists
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
