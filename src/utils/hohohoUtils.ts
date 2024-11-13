import { randomBytes } from "crypto";
import {
  ApplicationDetails,
  ApplicationDetailsDTO,
} from "../types/hohohoTypes";

export const generateVerificationCode = (): string => {
  const randomValues = randomBytes(6);

  let code = "";
  for (let i = 0; i < 6; i++) {
    code += (randomValues[i] % 10).toString();
  }

  return code;
};

export const sanitizeApplicationDetails = (
  rawData: ApplicationDetails
): ApplicationDetailsDTO => {
  const {
    full_name,
    email_address,
    phone_number,
    preferred_language,
    website_url,
    website_description,
    website_features,
  } = rawData;

  // Map snake_case to camelCase and sanitize
  return {
    fullName: full_name,
    emailAddress: email_address,
    phoneNumber: phone_number,
    preferredLanguage: preferred_language,
    websiteUrl: website_url,
    websiteDescription: website_description,
    websiteFeatures: website_features ? website_features.split(",") : [],
  };
};