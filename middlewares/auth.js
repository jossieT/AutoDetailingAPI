const passport = require('passport');
const httpStatus = require('http-status');
const { ApiError } = require('../utils/ApiError');

// Basic verify callback without role check
const basicVerifyCallback = (req, resolve, reject) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    const getuser = await user;
    
    // Verify that user is either admin or staff
    if (await getuser.role !== 'admin' && await getuser.role !== 'staff') {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Access denied: Admin or Staff only'));
    }

    req.user = user;
    resolve();
};

// Role-specific verify callback
const verifyCallBack = (req, resolve, reject, requiredRole) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    const getuser = await user;
    
    // Only check role if requiredRole is specified
    if (requiredRole && await getuser.role !== requiredRole) {
        return reject(new ApiError(httpStatus.FORBIDDEN, `Access denied: ${requiredRole}s only`));
    }

    req.user = user;
    resolve();
};

// Basic authentication that works for both admin and staff
const authenticate = async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, basicVerifyCallback(req, resolve, reject)
        )(req, res, next);
    })
        .then(() => next())
        .catch((error) => next(error));
};

// Role-based authentication
const auth = (requiredRole) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallBack(req, resolve, reject, requiredRole)
        )(req, res, next);
    })
        .then(() => next())
        .catch((error) => next(error));
};

/**
 * Admin Authentication Middleware
 */
// const authenticateAdmin = (req, res, next) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Access denied' });
//     }
//     next();
// };

// Export different auth middlewares
module.exports = {
    authenticate,                       // Basic auth - any authenticated user
    auth,                              // Role-based auth
    adminAuth: auth('admin'),          // Admin only
    staffAuth: auth('staff')           // Staff only
};