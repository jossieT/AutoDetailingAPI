const joi = require('joi');

const createBlogSchema = {
    body: joi.object().keys({
        title: joi.string().required(),
        content: joi.string().required(),
        image: joi.string().allow('', null), // Allow image URL to be optional
    }),
};

const updateBlogSchema = {
    body: joi.object().keys({
        title: joi.string(),
        content: joi.string(),
        image: joi.string().allow('', null),
    }),
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a blog ID
    }),
};

const getBlogSchema = {
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a blog ID
    }),
};

const deleteBlogSchema = {
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a blog ID
    }),
};

module.exports = {
    createBlogSchema,
    updateBlogSchema,
    getBlogSchema,
    deleteBlogSchema,
};