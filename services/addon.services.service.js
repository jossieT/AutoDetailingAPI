// addOnService.js (Service Layer)
const AddOnService = require('../model/addon.service.model');

/**
 * Create a new add-on service
 * @param {Object} addOnData - Add-on details
 * @returns {Promise<Object>}
 */
const createAddOn = async (addOnData) => {
    const addOn = new AddOnService(addOnData);
    return await addOn.save();
};

/**
 * Fetch all add-on services
 * @returns {Promise<Array>}
 */
const getAllAddOns = async () => {
    return await AddOnService.find();
};

/**
 * Fetch a single add-on service by ID
 * @param {String} id - Add-on ID
 * @returns {Promise<Object>}
 */
const getAddOnById = async (id) => {
    return await AddOnService.findById(id);
};

/**
 * Update an add-on service by ID
 * @param {String} id - Add-on ID
 * @param {Object} updates - Add-on updates
 * @returns {Promise<Object>}
 */
const updateAddOn = async (id, updates) => {
    return await AddOnService.findByIdAndUpdate(id, updates, { new: true });
};

/**
 * Delete an add-on service by ID
 * @param {String} id - Add-on ID
 * @returns {Promise<Object>}
 */
const deleteAddOn = async (id) => {
    return await AddOnService.findByIdAndDelete(id);
};

module.exports = {
    createAddOn,
    getAllAddOns,
    getAddOnById,
    updateAddOn,
    deleteAddOn,
};
