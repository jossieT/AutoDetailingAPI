const Service = require('../model/service.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a new service
 * @param {Object} serviceBody
 * @returns {Promise<Service>}
 */
const createService = async (serviceBody) => {
    const isServiceNameTaken = await Service.findOne({ name: serviceBody.name });
    if (isServiceNameTaken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Service name is already taken");
    }

    

    return await Service.create(serviceBody);
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
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }

    if (updateBody.name && updateBody.name !== service.name) {
        const isServiceNameTaken = await Service.findOne({ name: updateBody.name });
        if (isServiceNameTaken) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Service name is already taken");
        }
    }

    Object.assign(service, updateBody);
    await service.save();
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
