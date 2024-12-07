const mongoose = require('mongoose');

const companyOverviewSchema = new mongoose.Schema({
    history: { type: String, required: true }, // History of the company
    mission: { type: String, required: true }, // Mission statement
    values: { type: [String], required: true }, // List of core values
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` field before saving
companyOverviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const CompanyOverview = mongoose.model('CompanyOverview', companyOverviewSchema);
module.exports = CompanyOverview;
