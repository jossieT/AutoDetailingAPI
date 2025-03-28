const mongoose = require('mongoose');

const partialDayOffSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, required: true }
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true,
        unique: true 
    },
    availableSlots: [String], // Time slots in AM/PM format
    unavailableSlots: [String], // Booked or blocked slots
    dayOff: { 
        type: Boolean, 
        default: false 
    },
    partialDayOff: [partialDayOffSchema] // Array of partial day-offs
});

// Add index for efficient date queries
workingHoursSchema.index({ date: 1 });

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

module.exports = WorkingHours;
