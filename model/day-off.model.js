const mongoose = require('mongoose');

const timeRangeSchema = new mongoose.Schema({
    startTime: String,
    endTime: String
}, { _id: false });

const dayOffSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true
    },
    reason: { 
        type: String,
        required: true
    },
    isFullDay: {
        type: Boolean,
        default: false
    },
    timeRange: {
        type: timeRangeSchema,
        required: function() {
            return !this.isFullDay;
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt timestamp before saving
dayOffSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DayOff', dayOffSchema);
