const passport = require('passport');
const httpStatus = require('http-status');
const { ApiError } = require('../utils/ApiError');

const verifyCallBack = (req, resolve, reject) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));
    }
    const getuser = await user;
    //console.log("trying to login: ", getuser.role);
    if (await getuser.role !== 'admin') {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Access denied: Admins only'));
    }

    req.user = user;
    resolve();
};

const auth = async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallBack(req, resolve, reject)
        )(req, res, next);
    })
        .then(() => next())
        .catch((error) => next(error));
}

/**
 * Admin Authentication Middleware
 */
// const authenticateAdmin = (req, res, next) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Access denied' });
//     }
//     next();
// };

module.exports = { auth };