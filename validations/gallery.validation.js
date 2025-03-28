const joi = require('joi');

const createGallerySchema = {
    body: joi.object().keys({
        // Will be set by controller
        'description.en': joi.string().allow('', null),
        'description.am': joi.string().allow('', null),
        image: joi.string().allow('', null),
        available: joi.boolean().default(true),
    }),
};

const updateGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        'description.en': joi.string().allow('', null),
        'description.am': joi.string().allow('', null),
        image: joi.string().allow('', null),
        available: joi.boolean(),
    }),
};

const getGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().hex().length(24).required(),
    }),
};

const deleteGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().hex().length(24).required(),
    }),
};

module.exports = {
    createGallerySchema,
    updateGallerySchema,
    getGallerySchema,
    deleteGallerySchema,
};