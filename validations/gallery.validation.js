const joi = require('joi');

const createGallerySchema = {
    body: joi.object().keys({
        // Will be set by controller
        'description.en': joi.string().required(),
        'description.am': joi.string().required(),
        image: joi.string().allow('', null),
    }),
};

const updateGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        'description.en': joi.string().required(),
        'description.am': joi.string().required(),
        image: joi.string().allow('', null),
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