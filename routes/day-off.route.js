const express = require('express');
const dayOffController = require('../controller/day-off.controller');
const router = express.Router();
const validate  = require('../middlewares/validate');
const dayOffValidation = require('../validations/day-off.validation');
const { authenticate, adminAuth } = require('../middlewares/auth');


/**
 * @openapi
 * tags:
 *   name: Day Off Controller
 *   description: API for managing Day-Off in the Auto Detailing system
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     DayOff:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f8f4e82d81c4357b041569
 *         date:
 *           type: string
 *           format: date
 *           example: 2024-12-25T00:00:00.000Z
 *         reason:
 *           type: string
 *           example: Christmas Holiday
 *         isGlobal:
 *           type: boolean
 *           example: true
 *         isFullDay:
 *           type: boolean
 *           example: true
 *         timeRange:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               example: 2:00 PM
 *             endTime:
 *               type: string
 *               example: 4:00 PM
 *         affectedStaff:
 *           type: array
 *           items:
 *             type: string
 *             example: 64f8f4e82d81c4357b041567
 *         status:
 *           type: string
 *           enum: [active, cancelled]
 *           example: active
 */

/**
 * @openapi
 * '/api/day-offs/global':
 *   post:
 *     tags: [Day Off Controller]
 *     summary: Create a global day-off (full or partial)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - reason
 *               - isFullDay
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-10
 *               reason:
 *                 type: string
 *                 example: Company Holiday
 *               isFullDay:
 *                 type: boolean
 *                 example: true
 *               startTime:
 *                 type: string
 *                 pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
 *                 example: 10:00 AM
 *               endTime:
 *                 type: string
 *                 pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
 *                 example: 2:00 PM
 *     responses:
 *       201:
 *         description: Day-off created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DayOff'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * '/api/day-offs/staff':
 *   post:
 *     tags: [Day Off Controller]
 *     summary: Create a staff day-off (full or partial)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - reason
 *               - isFullDay
 *               - staffIds
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-10
 *               reason:
 *                 type: string
 *                 example: Staff Training
 *               isFullDay:
 *                 type: boolean
 *                 example: false
 *               startTime:
 *                 type: string
 *                 pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
 *                 example: 2:00 PM
 *               endTime:
 *                 type: string
 *                 pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
 *                 example: 4:00 PM
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [64f8f4e82d81c4357b041567]
 *     responses:
 *       201:
 *         description: Day-off created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DayOff'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * '/api/day-offs':
 *   get:
 *     tags: [Day Off Controller]
 *     summary: Get day-offs with filters
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [global, staff]
 *         description: Filter by day-off type
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *         description: Filter by staff member ID
 *     responses:
 *       200:
 *         description: List of day-offs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DayOff'
 */

/**
 * @openapi
 * '/api/day-offs/{dayOffId}':
 *   patch:
 *     tags: [Day Off Controller]
 *     summary: Update a day-off
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dayOffId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DayOff'
 *     responses:
 *       200:
 *         description: Day-off updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DayOff'
 */

/**
 * @openapi
 * '/api/day-offs/{dayOffId}':
 *   delete:
 *     tags: [Day Off Controller]
 *     summary: Delete a day-off
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dayOffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Day-off deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

/**
 * @openapi
 * '/api/day-offs/{date}':
 *   get:
 *     tags: [Day Off Controller]
 *     summary: Get day-offs by date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get day-offs for (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of day-offs for the given date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DayOff'
 */

// Create a new global day-off (full or partial)
router.post('/api/day-offs/global', 
    authenticate,
    adminAuth,
    validate(dayOffValidation.createDayOffSchema),
    dayOffController.createGlobalDayOff
);

// Create a new staff day-off (full or partial)
router.post('/api/day-offs/staff',
    authenticate,
    adminAuth,
    validate(dayOffValidation.createStaffDayOff),
    dayOffController.createStaffDayOff
);

// Get all day offs
router.get('/api/day-offs', 
    validate(dayOffValidation.getDayOffsSchema),
    dayOffController.getAllDayOffs
);


// Update a day off
router.patch('/api/day-offs/:dayOffId', 
    authenticate,
    adminAuth,
    validate(dayOffValidation.updateDayOffSchema),
    dayOffController.updateDayOff
);

// Get day offs by date
router.get('/api/day-offs/:date',
     validate(dayOffValidation.getDayOffsByDate),
     authenticate,
     dayOffController.getDayOffsByDate);

// Delete a day off by id
router.delete('/api/day-offs/:dayOffId',
    authenticate,
    adminAuth,
    dayOffController.deleteDayOff
);

module.exports = router;
