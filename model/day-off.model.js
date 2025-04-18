const mongoose = require('mongoose');

const timeRangeSchema = new mongoose.Schema({
    startTime: String,
    endTime: String
}, { _id: false });

const dayOffSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true,
        index: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    isGlobal: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    isFullDay: { 
        type: Boolean, 
        default: false 
    },
    timeRange: {
        startTime: {
            type: String,
            required: function() { return !this.isFullDay; }
        },
        endTime: {
            type: String,
            required: function() { return !this.isFullDay; }
        }
    },
    affectedStaff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active',
        index: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

// Update the updatedAt timestamp before saving
dayOffSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Compound index for better query performance
dayOffSchema.index({ 
    date: 1, 
    isGlobal: 1, 
    status: 1 
});

// Index for staff queries
dayOffSchema.index({ 
    affectedStaff: 1, 
    date: 1 
});

module.exports = mongoose.model('DayOff', dayOffSchema);
