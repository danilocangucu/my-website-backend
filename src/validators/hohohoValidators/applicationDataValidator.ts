import Joi from "joi";

export const applicationDataValidator = Joi.object({
  applicationInitiationId: Joi.number().required().messages({
    "number.base": "Application Initiation ID must be a number",
    "any.required": "Application Initiation ID is required",
  }),
  personalInformation: Joi.object({
    fullName: Joi.string().required().messages({
      "string.base": "Full Name must be a string",
      "string.empty": "Full Name is required",
    }),
    emailAddress: Joi.string().email().allow("").messages({
      "string.base": "Email Address must be a string",
      "string.email": "Please provide a valid email address",
    }),
    phoneNumber: Joi.string().allow("").messages({
      "string.base": "Phone Number must be a string",
    }),
    preferredLanguage: Joi.string().allow("").messages({
      "string.base": "Preferred Language must be a string",
    }),
  })
    .required()
    .messages({
      "object.base": "Personal Information must be an object",
      "object.empty": "Personal Information is required",
    }),

  aboutProject: Joi.object({
    websiteDescription: Joi.string().required().messages({
      "string.base": "Website Description must be a string",
      "string.empty": "Website Description is required",
    }),
    websiteFeatures: Joi.array()
      .items(Joi.string().allow(""))
      .length(3)
      .required()
      .messages({
        "array.base": "Website Features must be an array",
        "array.length": "Website Features must contain exactly 3 elements",
      }),
  })
    .required()
    .messages({
      "object.base": "About Project must be an object",
      "object.empty": "About Project is required",
    }),

  isCompleted: Joi.boolean().required().messages({
    "boolean.base": "isCompleted must be a boolean",
    "any.required": "isCompleted is required",
  }),
});
