const joi = require('joi');

const createBlogSchema = {
    body: joi.object().keys({
        title: joi.string().required(),
        content: joi.string().required(),
        author: joi.string().required(), // Assuming author is a user ID
    }),
};

const updateBlogSchema = {
    body: joi.object().keys({
        title: joi.string(),
        content: joi.string(),
        author: joi.string(), // Assuming author is a user ID
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