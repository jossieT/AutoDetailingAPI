const testimonialService = require('../services/testimonial.service');
const catchAsync = require('../utils/catchAsync');

// Create a new testimonial
const createTestimonial = catchAsync(async (req, res) => {
    const testimonial = await testimonialService.createTestimonial(req.body);
    res.status(201).json(testimonial);
});

// Get all testimonials
const getAllTestimonials = catchAsync(async (req, res) => {
    const testimonials = await testimonialService.getAllTestimonials();
    res.status(200).json(testimonials);
});

// Get a testimonial by ID
const getTestimonialById = catchAsync(async (req, res) => {
    const testimonial = await testimonialService.getTestimonialById(req.params.testimonialId);
    res.status(200).json(testimonial);
});

// Update a testimonial by ID
const updateTestimonialById = catchAsync(async (req, res) => {
    const updatedTestimonial = await testimonialService.updateTestimonialById(req.params.testimonialId, req.body);
    res.status(200).json(updatedTestimonial);
});

// Delete a testimonial by ID
const deleteTestimonialById = catchAsync(async (req, res) => {
    await testimonialService.deleteTestimonialById(req.params.testimonialId);
    res.status(204).send();
});

module.exports = {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonialById,
    deleteTestimonialById,
};
