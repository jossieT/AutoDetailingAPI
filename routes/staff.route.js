const express = require('express');
const staffController = require('../controller/staff.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

/** GET Methods */
/**
 * @openapi
 * '/api/staff':
 *  get:
 *     tags:
 *     - Staff Controller
 *     summary: Get all staff members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *        description: A list of all staff members
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    example: "12345"
 *                  name:
 *                    type: string
 *                    example: "John Doe"
 *                  role:
 *                    type: string
 *                    example: "Staff"
 *      401:
 *        description: Unauthorized (Admin auth required)
 *      500:
 *        description: Server Error
 */

/** POST Methods */
/**
 * @openapi
 * '/api/staff':
 *  post:
 *     tags:
 *     - Staff Controller
 *     summary: Add a new staff member
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *              - role
 *            properties:
 *              name:
 *                type: string
 *                description: Name of the staff member
 *                example: "Jane Doe"
 *              role:
 *                type: string
 *                description: Role of the staff member
 *                example: "Admin"
 *     responses:
 *      201:
 *        description: Staff member added successfully
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized (Admin auth required)
 *      500:
 *        description: Server Error
 */

/** PUT Methods */
/**
 * @openapi
 * '/api/staff/{staffId}':
 *  put:
 *     tags:
 *     - Staff Controller
 *     summary: Edit staff details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: staffId
 *         in: path
 *         required: true
 *         description: ID of the staff member
 *         schema:
 *           type: string
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Updated name of the staff member
 *                example: "Jane Doe"
 *              role:
 *                type: string
 *                description: Updated role of the staff member
 *                example: "Manager"
 *     responses:
 *      200:
 *        description: Staff details updated successfully
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized (Admin auth required)
 *      404:
 *        description: Staff member not found
 *      500:
 *        description: Server Error
 */

/** DELETE Methods */
/**
 * @openapi
 * '/api/staff/{staffId}':
 *  delete:
 *     tags:
 *     - Staff Controller
 *     summary: Delete a staff member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: staffId
 *         in: path
 *         required: true
 *         description: ID of the staff member to delete
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Staff member deleted successfully
 *      401:
 *        description: Unauthorized (Admin auth required)
 *      404:
 *        description: Staff member not found
 *      500:
 *        description: Server Error
 */

/** GET Methods */
/**
 * @openapi
 * '/api/staff/{staffId}/bookings':
 *  get:
 *     tags:
 *     - Staff Controller
 *     summary: Get bookings assigned to a staff member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: staffId
 *         in: path
 *         required: true
 *         description: ID of the staff member
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: A list of bookings assigned to the staff member
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  bookingId:
 *                    type: string
 *                    example: "67890"
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: "2025-01-09T14:00:00Z"
 *                  customerName:
 *                    type: string
 *                    example: "Customer Name"
 *      401:
 *        description: Unauthorized (Admin auth required)
 *      404:
 *        description: Staff member not found
 *      500:
 *        description: Server Error
 */


// Get all staff
router.get('/api/staff', auth, staffController.allStaff);
// Add a new staff member
router.post('/api/staff', auth, staffController.addStaff);

// Edit staff details
router.put('/api/staff/:staffId', auth, staffController.editStaff);

// Delete staff
router.delete('/api/staff/:staffId', auth, staffController.deleteStaff);

// Get bookings assigned to staff
router.get('/api/staff/:staffId/bookings', auth, staffController.getStaffBookings);

module.exports = router;
