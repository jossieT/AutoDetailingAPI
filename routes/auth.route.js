const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { userValidation, authValidation } = require('./../validations');
const { authController } = require('../controller');
//const { authLimiter } = require('./../middlewares/authLimiter');

    /** POST Methods */
    /**
     * @openapi
     * '/api/auth/register':
     *  post:
     *     tags:
     *     - User Controller
     *     summary: Create a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - name
     *              - email
     *              - password
     *            properties:
     *              name:
     *                type: string
     *                default: johndoe 
     *              email:
     *                type: string
     *                default: johndoe@mail.com
     *              password:
     *                type: string
     *                default: johnDoe20!@
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */

/** POST Methods */
/**
 * @openapi
 * '/api/auth/login':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Login a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      200:
 *        description: Successfully logged in
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: object
 *                  properties:
 *                    access:
 *                      type: object
 *                      properties:
 *                        token:
 *                          type: string
 *                          description: JWT Access Token
 *                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                        expires:
 *                          type: string
 *                          format: date-time
 *                          description: Access token expiration time
 *                          example: "2025-01-08T20:44:24.012Z"
 *                    refresh:
 *                      type: object
 *                      properties:
 *                        token:
 *                          type: string
 *                          description: Refresh Token
 *                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                        expires:
 *                          type: string
 *                          format: date-time
 *                          description: Refresh token expiration time
 *                          example: "2025-02-07T20:14:24.015Z"
 *      401:
 *        description: Unauthorized (Invalid credentials)
 *      404:
 *        description: User not found
 *      500:
 *        description: Server Error
 */

/**
 * @openapi
 * '/api/auth/refresh-token':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Refresh JWT tokens
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - refreshToken
 *            properties:
 *              refreshToken:
 *                type: string
 *                description: The refresh token
 *                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *      200:
 *        description: Tokens refreshed successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: object
 *                  properties:
 *                    access:
 *                      type: object
 *                      properties:
 *                        token:
 *                          type: string
 *                          description: New JWT Access Token
 *                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                        expires:
 *                          type: string
 *                          format: date-time
 *                          description: Access token expiration time
 *                          example: "2025-01-08T20:44:24.012Z"
 *                    refresh:
 *                      type: object
 *                      properties:
 *                        token:
 *                          type: string
 *                          description: New Refresh Token
 *                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                        expires:
 *                          type: string
 *                          format: date-time
 *                          description: Refresh token expiration time
 *                          example: "2025-02-07T20:14:24.015Z"
 *      400:
 *        description: Bad Request (Invalid token)
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */


router.post('/auth/register',
     validate(userValidation.createUserSchema)
    ,authController.register
);

router.post('/auth/login',
        validate(authValidation.loginSchema)
       ,authController.login
    );

router.post(
'/auth/refresh-token',
validate(authValidation.refreshTokenSchema),
authController.refreshToken
      );
  


module.exports = router;