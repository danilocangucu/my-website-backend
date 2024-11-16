export interface ApplicationInitiation {
  id: number;
  email: string;
  code: string;
  created_at: string;
  expires_at: string;
  status: "pending" | "active" | "expired";
  updated_at: string;
}

export interface RawApplicationDetails {
  id: number;
  application_initiation_id: number; // FK from application_initiations

  // Personal Information
  full_name: string;
  email_address: string;
  phone_number: string;
  preferred_language: string;

  // About You
  about_you_work: string | null;
  about_project_context: string | null;

  // About Your Website
  website_reason: string | null;
  website_main_description: string | null;
  website_features_description: string | null;
  website_main_feature: string | null;
  website_additional_features: string | null;
  website_content_material: string | null;

  // Links and References
  current_presence_link1: string | null;
  current_presence_link2: string | null;
  current_presence_link3: string | null;
  reference_website_link1: string | null;
  reference_website_link2: string | null;
  reference_website_link3: string | null;

  // Final Thoughts
  final_thoughts: string | null;

  // Metadata
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetailsDTO {
  personalInformation: {
    fullName: string;
    emailAddress: string;
    phoneNumber: string | null;
    preferredLanguage: string;
  };
  aboutYou: {
    work: string | null;
    projectContext: string | null;
  };
  aboutYourWebsite: {
    websiteReason: string | null;
    websiteMainDescription: string | null;
    websiteFeaturesDescription: string | null;
    websiteMainFeature: string | null;
    websiteAdditionalFeatures: string | null;
    websiteContentMaterial: string | null;
  };
  linksAndReferences: {
    currentPresence: {
      link1: string | null;
      link2: string | null;
      link3: string | null;
    };
    referenceWebsites: {
      link1: string | null;
      link2: string | null;
      link3: string | null;
    };
  };
  finalThoughts: string | null;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}
