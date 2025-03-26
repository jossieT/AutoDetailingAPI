const mongoose = require('mongoose');

const deletedBookingSchema = new mongoose.Schema({
    originalId: mongoose.Schema.Types.ObjectId,
    deletedAt: Date,
    bookingData: mongoose.Schema.Types.Mixed
});

const DeletedBooking = mongoose.model('DeletedBooking', deletedBookingSchema);

module.exports = DeletedBooking; 