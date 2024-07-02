const Joi = require('joi');

const postSchema = Joi.object({
    title: Joi.string().required(),
    desc: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = {
    postSchema
};
