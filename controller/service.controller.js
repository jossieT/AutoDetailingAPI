const serviceService = require('../services/service.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');

/**
 * Create a new service
 */
const createService = catchAsync(async (req, res) => {

    // Check if an image file is uploaded
    let image = null;
    if (req.file) {
        image = req.file.path; // Cloudinary URL is in `file.path`
    }
    req.body.image = image;

    const service = await serviceService.createService(req.body);
    res.status(httpStatus.CREATED).send(service);
});

/**
 * Get all services
 */
const getServices = catchAsync(async (req, res) => {
    const services = await serviceService.getServices();
    res.status(httpStatus.OK).send(services);
});

/**
 * Get a single service by ID
 */
const getServiceById = catchAsync(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.serviceId);
    res.status(httpStatus.OK).send(service);
});

/**
 * Update a service by ID
 */
const updateServiceById = catchAsync(async (req, res) => {
    const service = await serviceService.updateServiceById(req.params.serviceId, req.body);
    res.status(httpStatus.OK).send(service);
});

/**
 * Delete a service by ID
 */
const deleteServiceById = catchAsync(async (req, res) => {
    await serviceService.deleteServiceById(req.params.serviceId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateServiceById,
    deleteServiceById,
};
