const mongoose = require('mongoose');

const dayOffSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true, 
        unique: true 
    },
    reason: { 
        type: String,
        required: true
    },
    times: {
        type: [String],
        default: [],
        validate: {
            validator: function(times) {
                // If times array is empty, it's considered a full day off
                return true;
            }
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
