import Joi from "joi";

export const errorEmailConfigValidator = Joi.object({
  ZOHO_EMAIL: Joi.string().email().required().messages({
    "any.required": "ZOHO_EMAIL environment variable is required",
    "string.email": "ZOHO_EMAIL must be a valid email address",
  }),
  ZOHO_PASSWORD: Joi.string().min(1).required().messages({
    "any.required": "ZOHO_PASSWORD environment variable is required",
    "string.min": "ZOHO_PASSWORD cannot be empty",
  }),
  MY_EMAIL: Joi.string().email().required().messages({
    "any.required": "MY_EMAIL environment variable is required",
    "string.email": "MY_EMAIL must be a valid email address",
  }),
});
