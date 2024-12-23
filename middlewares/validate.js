const joi = require('joi');
const { ApiError } = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    const validSchema = ['params', 'query', 'body'].reduce((acc, key) => {
        if (schema[key]) {
            acc[key] = schema[key];
        }
        return acc;
    }, {});
    const object = ['params', 'query', 'body'].reduce((acc, key) => {
        if (schema[key]) {
            acc[key] = req[key];
        }
        return acc;
    }, {});
    const { value, error } = joi.compile(validSchema).validate(object);
    if (error) {
        const errors = error.details.map((detail) => detail.message).join(',');
        next(new ApiError(400, errors));
    } else {
        Object.assign(req, value);
        next();
    }
};

module.exports = validate;