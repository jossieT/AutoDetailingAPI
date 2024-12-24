const serviceService = require('../services/service.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');

/**
 * Create a new service
 */
const createService = catchAsync(async (req, res) => {

    // Check if an image file is uploaded
    let uploadedImage = null;
    if (req.file) {
        uploadedImage = req.file.path; // Cloudinary URL is in `file.path`
        req.body.image = uploadedImage;
    } else {
        uploadedImage = req.body.image;
    }
    req.body.image = uploadedImage;
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

    // Check if a new image file is uploaded
    if (req.file) {
        // Assign the uploaded image path (Cloudinary URL) to req.body.image
        req.body.image = req.file.path;
    } else if (!req.body.image) {
        // Optional: Keep the existing image if neither file nor body image is provided
        const existingService = await serviceService.getServiceById(req.params.serviceId);
        if (existingService) {
            req.body.image = existingService.image;
        }
    }

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
