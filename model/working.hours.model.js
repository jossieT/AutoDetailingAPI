const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
    startTime: { type: String, required: true }, // e.g., "06:00"
    endTime: { type: String, required: true }, // e.g., "14:00"
    intervalMinutes: { type: Number, default: 30 }, // Default interval in minutes
});

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

module.exports = WorkingHours;
