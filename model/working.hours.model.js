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
        index: true
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    availableSlots: [String], // Time slots in AM/PM format
    unavailableSlots: [String], // Booked or blocked slots
    dayOff: { 
        type: Boolean, 
        default: false 
    },
    partialDayOff: [partialDayOffSchema] // Array of partial day-offs
});

// Update the index definition
workingHoursSchema.index({ date: 1, staff: 1 }, { 
    unique: true,
    partialFilterExpression: { 
        staff: { $exists: true } 
    }
});

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

module.exports = WorkingHours;
