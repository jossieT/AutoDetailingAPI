const express = require('express');
const { authenticate } = require('../middlewares/auth');
const profileController = require('../controller/profile.controller');
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Profile
 *   description: User profile management APIs
 */

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get logged in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     assignedBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *   
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update logged in user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     phone:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

// Get my profile
router.get('/api/profile/me', authenticate, profileController.getMyProfile);

// Update my profile
router.patch('/api/profile/me', authenticate, profileController.updateMyProfile);

module.exports = router; 