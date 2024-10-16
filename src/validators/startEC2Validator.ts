import Joi from "joi";

export const startEC2Validator = Joi.object({
  projectName: Joi.string()
    .valid("goldenrack", "lovetokens")
    .required()
    .messages({
      "any.required": "projectName is required",
      "any.only": "projectName must be either 'goldenrack' or 'lovetokens'",
    }),
});
