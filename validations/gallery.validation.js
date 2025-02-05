const joi = require('joi');

const createGallerySchema = {
    body: joi.object().keys({
        imageUrl: joi.string().allow('', null),
        description: joi.string().allow('', null),
    }),
};

const updateGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().required(),
    }),
    body: joi.object().keys({
        imageUrl: joi.string().allow('', null),
        description: joi.string().allow('', null),
    }),
};

const getGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().required(),
    }),
};

const deleteGallerySchema = {
    params: joi.object().keys({
        galleryId: joi.string().required(),
    }),
};

module.exports = {
    createGallerySchema,
    updateGallerySchema,
    getGallerySchema,
    deleteGallerySchema,
}; 