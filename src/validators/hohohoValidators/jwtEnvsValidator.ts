import Joi from "joi";

export const jwtEnvsValidator = Joi.object({
  HOHOHO_JWT_SECRET: Joi.string().required().messages({
    "any.required": "HOHOHO_JWT_SECRET is required and must be a string.",
  }),
  HOHOHO_JWT_EXPIRY: Joi.string().required().messages({
    "any.required": "HOHOHO_JWT_EXPIRY is required and must be a string.",
  }),
}).unknown();
