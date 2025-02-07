const joi = require('joi');

const createGallerySchema = {
    body: joi.object().keys({
        imageUrl: joi.string().allow('', null), // Will be set by controller
        description_en: joi.string().required(), // Changed from description.en
        description_am: joi.string().required(), // Changed from description.am
    }),
};

const updateGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().hex().length(24).required(),
    }),
    body: joi.object().keys({
        imageUrl: joi.string().allow('', null),
        description_en: joi.string().allow('', null), // Changed from description.en
        description_am: joi.string().allow('', null), // Changed from description.am
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