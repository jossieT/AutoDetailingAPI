const CompanyOverview = require('../model/company.overview.model');

const getCompanyOverview = async () => {
    return await CompanyOverview.findOne(); // Fetch the single overview record
};

const updateCompanyOverview = async (overviewData) => {
    const existingOverview = await CompanyOverview.findOne();
    if (existingOverview) {
        Object.assign(existingOverview, overviewData);
        return await existingOverview.save();
    }
    return await CompanyOverview.create(overviewData); // Create a new record if none exists
};

module.exports = {
    getCompanyOverview,
    updateCompanyOverview,
};
