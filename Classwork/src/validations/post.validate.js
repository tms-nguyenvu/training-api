const Joi = require("joi");

const postValidate = (payload) => {
    const postSchema = Joi.object({
        title: Joi.string().min(3).max(255).required().messages({
            "string.empty": "Title cannot be empty",
            "string.min": "Title must be at least 3 characters long",
            "string.max": "Title must not exceed 255 characters",
            "any.required": "Title is required",
        }),
        content: Joi.string().min(10).required().messages({
            "string.empty": "Content cannot be empty",
            "string.min": "Content must be at least 10 characters long",
            "any.required": "Content is required",
        }),
        author: Joi.string().required().messages({
            "string.empty": "Author cannot be empty",
            "any.required": "Author is required",
        }),
        status: Joi.boolean().valid(true, false).optional(),
    });

    return postSchema.validate(payload, { abortEarly: false });
};

module.exports = { postValidate };
