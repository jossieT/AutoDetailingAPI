const mongoose = require('mongoose');

const partialDayOffSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, required: true }
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true // Allow null values without indexing them
    },
    availableSlots: [String], // Time slots in AM/PM format
    unavailableSlots: [String], // Booked or blocked slots
    dayOff: { 
        type: Boolean, 
        default: false 
    },
    partialDayOff: [partialDayOffSchema], // Array of partial day-offs
}, { 
    timestamps: true
});

// IMPORTANT: We're replacing all index definitions with a single, clearer one
// This solves the E11000 duplicate key error

// First, remove any existing conflicting indexes during application startup
workingHoursSchema.statics.cleanIndexes = async function() {
    try {
        // Drop problematic indexes if they exist
        const indexes = await this.collection.indexes();
        const indexesToDrop = indexes.filter(index => 
            index.name === 'date_1_staff_1' ||
            (index.key && index.key.date && index.key.staff)
        );
        
        for (const index of indexesToDrop) {
            console.log(`Dropping index: ${index.name}`);
            await this.collection.dropIndex(index.name);
        }
        
        console.log("Cleared conflicting indexes");
    } catch (error) {
        console.error("Error cleaning indexes:", error.message);
    }
};

// Create separate, non-conflicting indexes
workingHoursSchema.index({ date: 1 });  // Simple date index for lookup
workingHoursSchema.index({ staff: 1 }); // Simple staff index for lookup

// Create a unique compound index ONLY for staff-specific entries
// This allows multiple global entries (where staff is null/undefined)
workingHoursSchema.index(
    { date: 1, staff: 1 }, 
    { 
        unique: true,
        sparse: true,  // Skip documents where staff field doesn't exist
        partialFilterExpression: { staff: { $exists: true, $ne: null } }
    }
);

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

// Call this during application startup
(async () => {
    try {
        await WorkingHours.cleanIndexes();
        console.log("Working hours indexes cleaned successfully");
    } catch (error) {
        console.error("Failed to clean indexes:", error);
    }
})();

module.exports = WorkingHours;
