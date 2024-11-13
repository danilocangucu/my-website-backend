import Joi from "joi";

// TODO do not allow more than email in the request body
export const registerApplicationValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
});
