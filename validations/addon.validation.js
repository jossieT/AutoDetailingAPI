const joi = require('joi');

const createAddOnService = {
    body: joi.object().keys({
        optionName: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }).required(),
        additionalPrice: joi.object().keys({
            minBasePrice: joi.number().required(),
            maxPrice: joi.number().required(),
        }).required(),
        features: joi.object().keys({
            en: joi.array().items(joi.string()),
            am: joi.array().items(joi.string()),
        }),
        description: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }).required(),
        duration: joi.number().required(),
        available: joi.boolean(),
    }),
};

const getAddOnServiceById = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(), // Assuming ObjectId is a 24-character hex string
    }),
};

const updateAddOnServiceById = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(), // Assuming ObjectId is a 24-character hex string
    }),
    body: joi.object().keys({
        optionName: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }).required(),
        additionalPrice: joi.object().keys({
            minBasePrice: joi.number().required(),
            maxPrice: joi.number().required(),
        }).required(),
        features: joi.object().keys({
            en: joi.array().items(joi.string()),
            am: joi.array().items(joi.string()),
        }),
        description: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }).required(),
        duration: joi.number().required(),
        available: joi.boolean(),
    }),
};

const deleteAddOnServiceById = {
    params: joi.object().keys({
        id: joi.string().hex().length(24).required(), // Assuming ObjectId is a 24-character hex string
    }),
};

module.exports = {
    createAddOnService,
    getAddOnServiceById,
    updateAddOnServiceById,
    deleteAddOnServiceById,
};