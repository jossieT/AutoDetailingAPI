const mongoose = require('mongoose');

const dayOffSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true }, // Day off date
    reason: { type: String }, // Reason for day off (e.g., "Weekend", "Holiday", "Staff-Initiated")
    times: [String], // Specific times (e.g., ["09:00", "11:00"] for partial day off)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DayOff', dayOffSchema);
