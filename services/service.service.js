const Service = require('../model/service.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a new service
 * @param {Object} serviceBody
 * @returns {Promise<Service>}
 */
const createService = async (serviceBody) => {
    const service = new Service(serviceBody);
    await service.save();
    return service;
};

/**
 * Get all services
 * @returns {Promise<Array<Service>>}
 */
const getServices = async () => {
    return await Service.find({});
};

/**
 * Get a service by ID
 * @param {String} serviceId
 * @returns {Promise<Service>}
 */
const getServiceById = async (serviceId) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }
    return service;
};

const getServicesByIds = async (serviceIds) => {
    return await Service.find({ _id: { $in: serviceIds } });
};

/**
 * Update a service by ID
 * @param {String} serviceId
 * @param {Object} updateBody
 * @returns {Promise<Service>}
 */
const updateServiceById = async (serviceId, updateBody) => {
    const service = await Service.findByIdAndUpdate(serviceId, updateBody, { new: true });
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }
    return service;
};

/**
 * Delete a service by ID
 * @param {String} serviceId
 * @returns {Promise<Service>}
 */
const deleteServiceById = async (serviceId) => {
    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }
    return service;
};

module.exports = {
    createService,
    getServices,
    getServiceById,
    getServicesByIds,
    updateServiceById,
    deleteServiceById,
};
