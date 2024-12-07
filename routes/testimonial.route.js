const express = require('express');
const testimonialController = require('../controller/testimonial.controller');

const router = express.Router();

// Create a new testimonial
router.post('/api/testimonials', testimonialController.createTestimonial);

// Get all testimonials
router.get('/api/testimonials', testimonialController.getAllTestimonials);

// Get a testimonial by ID
router.get('/api/testimonials:testimonialId', testimonialController.getTestimonialById);

// Update a testimonial by ID
router.patch('/api/testimonials:testimonialId', testimonialController.updateTestimonialById);

// Delete a testimonial by ID
router.delete('/api/testimonials:testimonialId', testimonialController.deleteTestimonialById);

module.exports = router;
