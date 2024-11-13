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
  full_name: string;
  email_address: string;
  phone_number: string;
  preferred_language: string;
  website_description: string;
  website_features: string;
}

export interface ApplicationDetailsDTO {
  personalInformation: {
    fullName: string;
    emailAddress: string;
    phoneNumber: string | null;
    preferredLanguage: string;
  };
  aboutProject: {
    websiteDescription: string;
    websiteFeatures: string[];
  };
}