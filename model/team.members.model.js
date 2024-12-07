const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "CEO", "Manager"
    bio: { type: String }, // Optional biography
    photoUrl: { type: String }, // URL to team member's photo
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` field before saving
teamMemberSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
module.exports = TeamMember;
