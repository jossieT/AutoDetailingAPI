const express = require('express');
const dayOffController = require('../controller/day-off.controller');
const router = express.Router();


/**
 * @openapi
 * tags:
 *   name: Day Off Controller
 *   description: API for managing Day-Off in the Auto Detailing system
 */

/**
 * @openapi
 * '/api/day-offs':
 *   post:
 *     tags:
 *       - Day Off Controller
 *     summary: Add a new day off
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-25
 *               reason:
 *                 type: string
 *                 example: "Christmas Holiday"
 *               times:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["09:00", "10:00"]
 *     responses:
 *       201:
 *         description: Day off created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 *   get:
 *     tags:
 *       - Day Off Controller
 *     summary: Get all day offs
 *     responses:
 *       200:
 *         description: A list of all day offs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2024-12-25
 *                   reason:
 *                     type: string
 *                     example: "Christmas Holiday"
 *                   times:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["09:00", "10:00"]
 *       500:
 *         description: Internal server error
 * '/api/day-offs/{date}':
 *   delete:
 *     tags:
 *       - Day Off Controller
 *     summary: Delete a day off by date
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date of the day off to delete
 *         example: 2024-12-25
 *     responses:
 *       200:
 *         description: Day off deleted successfully
 *       404:
 *         description: Day off not found
 *       500:
 *         description: Internal server error
 */


// Create a new day off
router.post('/api/day-offs', dayOffController.createDayOff);

// Get all day offs
router.get('/api/day-offs', dayOffController.getAllDayOffs);

// Delete a day off by date
router.delete('/api/day-offs/:date', dayOffController.deleteDayOff);

module.exports = router;
