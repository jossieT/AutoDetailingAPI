const mongoose = require('mongoose');

const timeRangeSchema = new mongoose.Schema({
    startTime: String,
    endTime: String
}, { _id: false });

const dayOffSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true,
        index: true // Remove unique constraint to allow multiple day-offs per date
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
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
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

// Create a compound index for date + timeRange to prevent overlapping time ranges
dayOffSchema.index({ 
    date: 1, 
    'timeRange.startTime': 1, 
    'timeRange.endTime': 1 
});

module.exports = mongoose.model('DayOff', dayOffSchema);
