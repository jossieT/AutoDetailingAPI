const { getCompanyOverview, updateCompanyOverview } = require('../services/company.overview.service');
const catchAsync = require('../utils/catchAsync');

const getOverview = catchAsync(async (req, res) => {
    const overview = await getCompanyOverview();
    res.status(200).json(overview);
});

const updateOverview = catchAsync(async (req, res) => {
    const updatedOverview = await updateCompanyOverview(req.body);
    res.status(200).json(updatedOverview);
});

module.exports = {
    getOverview,
    updateOverview,
};
