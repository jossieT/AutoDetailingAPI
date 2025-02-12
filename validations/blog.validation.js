const joi = require('joi');

const createBlogSchema = {
    body: joi.object().keys({
        'title.en': joi.string().required(),
        'title.am': joi.string().required(),
        'content.en': joi.string().required(),
        'content.am': joi.string().required(),
        image: joi.string().allow('', null), // Allow image URL to be optional
        author: joi.string().default('Swift Addis'),
        available: joi.boolean().default(true),
    }),
};

const updateBlogSchema = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        'title.en': joi.string(),
        'title.am': joi.string(),
        'content.en': joi.string(),
        'content.am': joi.string(),
        image: joi.string().allow('', null),
        author: joi.string().default('Swift Addis'),
        available: joi.boolean(),
    }),
};

const getBlogSchema = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(),
    }),
};

const deleteBlogSchema = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(),
    }),
};

module.exports = {
    createBlogSchema,
    updateBlogSchema,
    getBlogSchema,
    deleteBlogSchema,
};