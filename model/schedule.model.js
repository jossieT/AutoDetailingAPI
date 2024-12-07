const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    technician_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Technician', 
        required: true 
    },
    date: { type: Date, required: true },
    time_slots: [{ 
        start: { type: String, required: true }, // e.g., "10:00 AM"
        end: { type: String, required: true }, // e.g., "12:00 PM"
        status: { type: String, enum: ['Available', 'Booked'], default: 'Available' },
    }],
    createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;