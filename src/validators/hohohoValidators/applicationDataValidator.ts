import Joi from "joi";
import xss from "xss";

const sanitizeInput = (value: any): string => {
  if (value && typeof value === "string") {
    const sanitizedValue = xss(value);
    return sanitizedValue;
  }
  return value;
};

export const applicationDataValidator = Joi.object({
  applicationInitiationId: Joi.number().required().messages({
    "number.base": "Application Initiation ID must be a number",
    "any.required": "Application Initiation ID is required",
  }),

  personalInformation: Joi.object({
    fullName: Joi.string().required().allow("").custom(sanitizeInput).messages({
      "string.base": "Full Name must be a string",
      "string.empty": "Full Name is required",
    }),
    emailAddress: Joi.string()
      .email()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Email Address must be a string",
        "string.email": "Please provide a valid email address",
        "string.empty": "Email Address is required",
      }),
    phoneNumber: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Phone Number must be a string",
        "string.empty": "Phone Number is required",
      }),
    preferredLanguage: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Preferred Language must be a string",
        "string.empty": "Preferred Language is required",
      }),
  })
    .required()
    .messages({
      "object.base": "Personal Information must be an object",
      "object.empty": "Personal Information is required",
    }),

  aboutYou: Joi.object({
    work: Joi.string().required().allow("").custom(sanitizeInput).messages({
      "string.base": "Work Information must be a string",
      "string.empty": "Work Information is required",
    }),
    projectContext: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Project Context must be a string",
        "string.empty": "Project Context is required",
      }),
  })
    .required()
    .messages({
      "object.base": "About You must be an object",
      "object.empty": "About You is required",
    }),

  aboutYourWebsite: Joi.object({
    websiteReason: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Website Reason must be a string",
        "string.empty": "Website Reason is required",
      }),
    websiteMainDescription: Joi.string()
      .max(500)
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Website Main Description must be a string",
        "string.max": "Website Main Description cannot exceed 500 characters",
        "string.empty": "Website Main Description is required",
      }),
    websiteMainFeature: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Website Main Feature must be a string",
        "string.empty": "Website Main Feature is required",
      }),
    websiteAdditionalFeatures: Joi.object({
      feature1: Joi.string()
        .required()
        .allow("")
        .custom(sanitizeInput)
        .messages({
          "string.base": "Feature 1 must be a valid string",
          "string.empty": "Feature 1 is required",
        }),
      feature2: Joi.string()
        .required()
        .allow("")
        .custom(sanitizeInput)
        .messages({
          "string.base": "Feature 2 must be a valid string",
          "string.empty": "Feature 2 is required",
        }),
      feature3: Joi.string()
        .required()
        .allow("")
        .custom(sanitizeInput)
        .messages({
          "string.base": "Feature 3 must be a valid string",
          "string.empty": "Feature 3 is required",
        }),
    }),
    websiteContentMaterial: Joi.string()
      .required()
      .allow("")
      .custom(sanitizeInput)
      .messages({
        "string.base": "Website Content Material must be a string",
        "string.empty": "Website Content Material is required",
      }),
  })
    .required()
    .messages({
      "object.base": "About Your Website must be an object",
      "object.empty": "About Your Website is required",
    }),

  linksAndReferences: Joi.object({
    currentPresence: Joi.object({
      link1: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Current Presence Link 1 must be a valid URL",
        "string.uri": "Current Presence Link 1 must be a valid URL",
        "string.empty": "Current Presence Link 1 is required",
      }),
      link2: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Current Presence Link 2 must be a valid URL",
        "string.uri": "Current Presence Link 2 must be a valid URL",
        "string.empty": "Current Presence Link 2 is required",
      }),
      link3: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Current Presence Link 3 must be a valid URL",
        "string.uri": "Current Presence Link 3 must be a valid URL",
        "string.empty": "Current Presence Link 3 is required",
      }),
    })
      .required()
      .messages({
        "object.base": "Current Presence Links must be an object",
        "object.empty": "Current Presence Links are required",
      }),
    referenceWebsites: Joi.object({
      link1: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Reference Website Link 1 must be a valid URL",
        "string.uri": "Reference Website Link 1 must be a valid URL",
        "string.empty": "Reference Website Link 1 is required",
      }),
      link2: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Reference Website Link 2 must be a valid URL",
        "string.uri": "Reference Website Link 2 must be a valid URL",
        "string.empty": "Reference Website Link 2 is required",
      }),
      link3: Joi.string().allow("").custom(sanitizeInput).messages({
        "string.base": "Reference Website Link 3 must be a valid URL",
        "string.uri": "Reference Website Link 3 must be a valid URL",
        "string.empty": "Reference Website Link 3 is required",
      }),
    })
      .required()
      .messages({
        "object.base": "Reference Website Links must be an object",
        "object.empty": "Reference Website Links are required",
      }),
  })
    .required()
    .messages({
      "object.base": "Links and References must be an object",
      "object.empty": "Links and References are required",
    }),

  finalThoughts: Joi.string()
    .required()
    .allow("")
    .custom(sanitizeInput)
    .messages({
      "string.base": "Final Thoughts must be a string",
      "string.empty": "Final Thoughts is required",
    }),

  isComplete: Joi.boolean().required().messages({
    "boolean.base": "isComplete must be a boolean",
    "any.required": "isComplete is required",
  }),
});
