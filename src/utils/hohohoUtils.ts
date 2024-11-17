import { randomBytes } from "crypto";
import {
  RawApplicationDetails,
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
  rawData: RawApplicationDetails
): ApplicationDetailsDTO => {
  const {
    full_name,
    email_address,
    phone_number,
    preferred_language,
    about_you_work,
    about_project_context,
    website_reason,
    website_main_description,
    website_features_description,
    website_main_feature,
    website_additional_features,
    website_content_material,
    current_presence_link1,
    current_presence_link2,
    current_presence_link3,
    reference_website_link1,
    reference_website_link2,
    reference_website_link3,
    final_thoughts,
    is_complete,
    created_at,
    updated_at,
  } = rawData;

  // Map snake_case to camelCase and sanitize
  return {
    personalInformation: {
      fullName: full_name,
      emailAddress: email_address,
      phoneNumber: phone_number,
      preferredLanguage: preferred_language,
    },
    aboutYou: {
      work: about_you_work,
      projectContext: about_project_context,
    },
    aboutYourWebsite: {
      websiteReason: website_reason,
      websiteMainDescription: website_main_description,
      websiteFeaturesDescription: website_features_description,
      websiteMainFeature: website_main_feature,
      websiteAdditionalFeatures: website_additional_features,
      websiteContentMaterial: website_content_material,
    },
    linksAndReferences: {
      currentPresence: {
        link1: current_presence_link1,
        link2: current_presence_link2,
        link3: current_presence_link3,
      },
      referenceWebsites: {
        link1: reference_website_link1,
        link2: reference_website_link2,
        link3: reference_website_link3,
      },
    },
    finalThoughts: final_thoughts,
    isComplete: is_complete,
    createdAt: created_at,
    updatedAt: updated_at,
  };
};