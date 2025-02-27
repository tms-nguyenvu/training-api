const Joi = require("joi");

const todoValidate = (payload) => {
  const todoSchema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
      "string.empty": "Title cannot be empty",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 255 characters",
      "any.required": "Title is required",
    }),
    description: Joi.string().optional().messages({
      "string.base": "Description must be a string",
    }),
    status: Joi.string()
      .valid("pending", "in_progress", "completed")
      .optional()
      .messages({
        "any.only": "Status must be either pending, in_progress or completed",
      }),
    dueDate: Joi.date().optional().messages({
      "date.base": "Due date must be a valid date",
    }),
    createdBy: Joi.string().optional().messages({
      "string.empty": "Created by cannot be empty",
    }),
  });

  return todoSchema.validate(payload, { abortEarly: false });
};

module.exports = { todoValidate };
