const addOnService = require('../services/addon.services.service');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a new add-on service
 */
const createAddOn = async (req, res, next) => {
    try {
        const addOn = await addOnService.createAddOn(req.body);
        res.status(201).json({ message: 'Add-on created successfully', data: addOn });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all add-on services
 */
const getAllAddOns = async (req, res, next) => {
    try {
        const addOns = await addOnService.getAllAddOns();
        res.status(200).json({ message: 'Add-ons fetched successfully', data: addOns });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single add-on service by ID
 */
const getAddOnById = async (req, res, next) => {
    try {
        const addOn = await addOnService.getAddOnById(req.params.id);
        if (!addOn) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Add-on not found');
        }
        res.status(200).json({ message: 'Add-on fetched successfully', data: addOn });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an add-on service by ID
 */
const updateAddOn = async (req, res, next) => {
    try {
        const updatedAddOn = await addOnService.updateAddOn(req.params.id, req.body);
        if (!updatedAddOn) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Add-on not found');
        }
        res.status(200).json({ message: 'Add-on updated successfully', data: updatedAddOn });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an add-on service by ID
 */
const deleteAddOn = async (req, res, next) => {
    try {
        const deletedAddOn = await addOnService.deleteAddOn(req.params.id);
        if (!deletedAddOn) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Add-on not found');
        }
        res.status(200).json({ message: 'Add-on deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAddOn,
    getAllAddOns,
    getAddOnById,
    updateAddOn,
    deleteAddOn,
};
