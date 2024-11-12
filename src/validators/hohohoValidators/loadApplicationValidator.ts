import Joi from "joi";

export const loadApplicationValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "string.email": "Please provide a valid email address.",
  }),

  code: Joi.string().length(6).alphanum().required().messages({
    "string.base": "Verification code must be a valid string.",
    "string.empty": "Verification code is required.",
    "string.length": "Verification code must be 6 characters long.",
    "string.alphanum":
      "Verification code can only contain letters and numbers.",
  }),
});
