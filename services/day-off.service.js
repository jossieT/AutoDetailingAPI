const DayOff = require('../models/day-off.model');

const createDayOff = async (data) => {
    return await DayOff.create(data);
};

const getAllDayOffs = async () => {
    return await DayOff.find();
};

const deleteDayOff = async (date) => {
    return await DayOff.findOneAndDelete({ date });
};

module.exports = {
    createDayOff,
    getAllDayOffs,
    deleteDayOff,
};
