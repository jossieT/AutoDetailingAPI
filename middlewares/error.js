const mongoose = require("mongoose");
//const config = require("../config/config");
const httpStatus = require('http-status');
const { ApiError } = require("../utils/ApiError");
const logger = require("../config/logger");
require('dotenv').config();


const errorConverter = ( err, req, res, next) => {
    let error = err;
    if(!(error instanceof ApiError)) {
        const statusCode = 
        error.statusCode || error instanceof mongoose.Error 
        ? httpStatus.BAD_REQUEST
        :httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, error.stack);
    }
    next(error);
}

// const errorConverter = (err, req, res, next) => {
//     let error = err;
//     if (!(error instanceof ApiError)) {
//         const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
//         const message = error.message || httpStatus[statusCode];
//         error = new ApiError(statusCode, message, false, err.stack);
//     }
//     next(error);
// };

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if(process.env.NODE_ENV === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[statusCode];
    }
    const response = {
    error: true,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack}),
    };
    res.locals.errorMessage = message;
    if(process.env.NODE_ENV === 'development') {
        logger.error(err);
        //logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);
    }
    res.status(statusCode).send(response);
}

// const errorHandler = (err, req, res, next) => {
//     let { statusCode, message } = err;
//     if (process.env.NODE_ENV === 'production' && !err.isOperational) {
//         statusCode = httpStatus.INTERNAL_SERVER_ERROR;
//         message = httpStatus[statusCode];
//     }

//     res.status(statusCode).json({
//         code: statusCode,
//         message,
//         ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//     });
// };


module.exports = { errorHandler, errorConverter };