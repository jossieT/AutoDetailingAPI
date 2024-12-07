const express = require('express');
const bookingController = require('../controller/booking.controller');

const router = express.Router();

/** GET Methods */
/**
 * @openapi
 * '/api/available-slots':
 *  get:
 *     tags:
 *     - Booking Controller
 *     summary: Get available time slots for a specific date
 *     parameters:
 *      - in: query
 *        name: date
 *        schema:
 *          type: string
 *          format: date
 *        required: true
 *        description: The date to check for available slots (YYYY-MM-DD).
 *     responses:
 *      200:
 *        description: List of available slots
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                availableSlots:
 *                  type: array
 *                  items:
 *                    type: string
 *                    example: "06:00"
 *      400:
 *        description: Bad request (e.g., missing date query parameter)
 *      500:
 *        description: Server Error
 */

/**
 * @openapi
 * '/api/bookings':
 *  get:
 *     tags:
 *     - Booking Controller
 *     summary: Get all bookings
 *     responses:
 *      200:
 *        description: A list of bookings
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Booking'
 *      500:
 *        description: Server Error
 */

/** POST Methods */
/**
 * @openapi
 * '/api/bookings':
 *  post:
 *     tags:
 *     - Booking Controller
 *     summary: Create a new booking
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              clientDetails:
 *                type: object
 *                properties:
 *                  firstName:
 *                    type: string
 *                  lastName:
 *                    type: string
 *                  phone:
 *                    type: string
 *                  email:
 *                    type: string
 *              vehicleDetails:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                  make:
 *                    type: string
 *                  model:
 *                    type: string
 *                  year:
 *                    type: number
 *              serviceStartingTime:
 *                type: string
 *                example: "06:30"
 *              service_ids:
 *                type: array
 *                items:
 *                  type: string
 *                  example: "64f8f4e82d81c4357b041567"
 *              appointmentDate:
 *                type: string
 *                format: date
 *                example: "2024-12-06"
 *     responses:
 *      201:
 *        description: Booking created successfully
 *      400:
 *        description: Validation error
 *      500:
 *        description: Server Error
 */

/** GET Methods */
/**
 * @openapi
 * '/api/bookings/{bookingId}':
 *  get:
 *     tags:
 *     - Booking Controller
 *     summary: Get booking details by ID
 *     parameters:
 *      - in: path
 *        name: bookingId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the booking.
 *     responses:
 *      200:
 *        description: Booking details retrieved successfully
 *      404:
 *        description: Booking not found
 *      500:
 *        description: Server Error
 */

/** PATCH Methods */
/**
 * @openapi
 * '/api/bookings/{bookingId}':
 *  patch:
 *     tags:
 *     - Booking Controller
 *     summary: Update booking details
 *     parameters:
 *      - in: path
 *        name: bookingId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the booking to update.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            description: Partial booking details to update
 *     responses:
 *      200:
 *        description: Booking updated successfully
 *      404:
 *        description: Booking not found
 *      500:
 *        description: Server Error
 */

/** DELETE Methods */
/**
 * @openapi
 * '/api/bookings/{bookingId}':
 *  delete:
 *     tags:
 *     - Booking Controller
 *     summary: Delete a booking
 *     parameters:
 *      - in: path
 *        name: bookingId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the booking to delete.
 *     responses:
 *      204:
 *        description: Booking deleted successfully
 *      404:
 *        description: Booking not found
 *      500:
 *        description: Server Error
 */

/** PATCH Methods */
/**
 * @openapi
 * '/api/bookings/{bookingId}/assign/{userId}':
 *  patch:
 *     tags:
 *     - Booking Controller
 *     summary: Assign a staff member to a booking
 *     parameters:
 *      - in: path
 *        name: bookingId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the booking.
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The ID of the staff member to assign.
 *     responses:
 *      200:
 *        description: Staff member assigned successfully
 *      404:
 *        description: Booking or user not found
 *      500:
 *        description: Server Error
 */


// Route to get available slots
router.get('/api/available-slots', bookingController.getAvailableSlots);

// Create a new booking
router.post('/api/bookings', bookingController.createBooking);

// Get all bookings
router.get('/api/bookings', bookingController.getAllBookings);

// Get a booking by ID
router.get('/api/bookings/:bookingId', bookingController.getBookingById);

// Update a booking by ID
router.patch('/api/bookings/:bookingId', bookingController.updateBookingById);

// Delete a booking by ID
router.delete('/api/bookings/:bookingId', bookingController.deleteBookingById);

// Assign a user to a booking
router.patch('/api/bookings/:bookingId/assign/:userId', bookingController.assignUserToBooking);

module.exports = router;
