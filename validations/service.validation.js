const joi = require('joi');

const createServiceSchema = {
    body: joi.object().keys({
        name: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }),
        description: joi.object().keys({
            en: joi.string().required(),
            am: joi.string().required(),
        }),
        pricing: joi.object().keys({
                basePrice: joi.number(),
                maxPrice: joi.number(),
                fixedPrice: joi.number(),
        }).optional(),
        duration: joi.object().keys({
            SUV: joi.number(),
            AUTO: joi.number(),
        }).optional(),
        image: joi.string().uri().optional(),
        additionalServices: joi.array().items(joi.string()).optional(),
        features: joi.object().keys({
            en: joi.array().items(joi.string()),
            am: joi.array().items(joi.string()),
        }).optional(),
        available: joi.boolean(),
    }),
};

const updateServiceSchema = {
    body: joi.object().keys({
        name: joi.object().keys({
            en: joi.string().optional(),
            am: joi.string().optional(),
        }).optional(),
        description: joi.object().keys({
            en: joi.string().optional(),
            am: joi.string().optional(),
        }).optional(),
        pricing: joi.object().keys({
            basePrice: joi.number(),
            maxPrice: joi.number(),
       }).optional(),
        duration: joi.object().keys({
            SUV: joi.number().optional(),
            AUTO: joi.number().optional(),
        }).optional(),
        image: joi.string().uri().optional(),
        additionalServices: joi.array().items(joi.string()),
        features: joi.object().keys({
            en: joi.array().items(joi.string()),
            am: joi.array().items(joi.string()),
        }),
        available: joi.boolean(),
    }),
    params: joi.object().keys({
        serviceId: joi.string().required(), // Assuming id is a service ID
    }),
};

const getServiceSchema = {
    params: joi.object().keys({
        serviceId: joi.string().required(), // Assuming id is a service ID
    }),
};

const deleteServiceSchema = {
    params: joi.object().keys({
        serviceId: joi.string().required(), // Assuming id is a service ID
    }),
};

module.exports = {
    createServiceSchema,
    updateServiceSchema,
    getServiceSchema,
    deleteServiceSchema,
};