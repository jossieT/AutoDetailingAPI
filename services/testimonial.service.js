const Testimonial = require('../model/testimonial.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

// Create a new testimonial
const createTestimonial = async (testimonialData) => {
    return await Testimonial.create(testimonialData);
};

// Get all testimonials
const getAllTestimonials = async () => {
    return await Testimonial.find({});
};

// Get a testimonial by ID
const getTestimonialById = async (testimonialId) => {
    const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Testimonial not found');
    }
    return testimonial;
};

// Update a testimonial by ID
const updateTestimonialById = async (testimonialId, updateData) => {
    const testimonial = await Testimonial.findByIdAndUpdate(testimonialId, updateData, { new: true });
    if (!testimonial) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Testimonial not found');
    }
    return testimonial;
};

// Delete a testimonial by ID
const deleteTestimonialById = async (testimonialId) => {
    const testimonial = await Testimonial.findByIdAndDelete(testimonialId);
    if (!testimonial) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Testimonial not found');
    }
    return testimonial;
};

module.exports = {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonialById,
    deleteTestimonialById,
};
