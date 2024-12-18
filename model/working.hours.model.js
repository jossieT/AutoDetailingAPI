const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    availableSlots: [String], // Time slots in AM/PM format
    unavailableSlots: [String], // Booked or blocked slots
    dayOff: { type: Boolean, default: false }, // Full day off flag
    partialDayOff: [String], // Specific hours for partial day-off
});

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

module.exports = WorkingHours;
