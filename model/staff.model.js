const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    availability: { 
        type: Boolean, 
        default: true 
    }, // Indicates if the staff member is available
    assigned_reservations: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
