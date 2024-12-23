const joi = require('joi');

const createServiceSchema = {
    body: joi.object().keys({
        name: joi.string().required(),
        description: joi.string().required(),
        pricing: joi.object().keys({
            SUV: joi.object().keys({
                basePrice: joi.number(),
                maxPrice: joi.number(),
            }),
            AUTO: joi.object().keys({
                basePrice: joi.number(),
                maxPrice: joi.number(),
            }),
        }).required(),
        duration: joi.object().keys({
            SUV: joi.number(),
            AUTO: joi.number(),
        }).required(),
        image: joi.string().uri(),
        additionalServices: joi.array().items(joi.string()),
        features: joi.array().items(joi.string()),
        available: joi.boolean(),
    }),
};

const updateServiceSchema = {
    body: joi.object().keys({
        name: joi.string(),
        description: joi.string(),
        price: joi.object().keys({
            SUV: joi.object().keys({
                basePrice: joi.number(),
                maxPrice: joi.number(),
            }),
            AUTO: joi.object().keys({
                basePrice: joi.number(),
                maxPrice: joi.number(),
            }),
        }),
        duration: joi.object().keys({
            SUV: joi.number(),
            AUTO: joi.number(),
        }),
        image: joi.string().uri(),
        additionalServices: joi.array().items(joi.string()),
        features: joi.array().items(joi.string()),
        available: joi.boolean(),
    }),
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a service ID
    }),
};

const getServiceSchema = {
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a service ID
    }),
};

const deleteServiceSchema = {
    params: joi.object().keys({
        id: joi.string().required(), // Assuming id is a service ID
    }),
};

module.exports = {
    createServiceSchema,
    updateServiceSchema,
    getServiceSchema,
    deleteServiceSchema,
};