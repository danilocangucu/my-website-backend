import dotenv from "dotenv";
import { emailConfigValidator } from "../validators/errorEmailConfigValidator";
import { logger } from "../utils/logger";

// TODO nodemailerConfigs.ts needs to be refactored

dotenv.config();

const envVarsToValidate = {
  ZOHO_EMAIL: process.env.ZOHO_EMAIL,
  ZOHO_PASSWORD: process.env.ZOHO_PASSWORD,
  MY_EMAIL: process.env.MY_EMAIL,
};

const hohohoEnvVarsToValidate = {
  ZOHO_EMAIL: process.env.HOHOHO_ZOHO_EMAIL,
  ZOHO_PASSWORD: process.env.HOHOHO_ZOHO_PASSWORD,
  MY_EMAIL: process.env.MY_EMAIL,
};

const { error, value: envVars } =
  emailConfigValidator.validate(envVarsToValidate);

if (error) {
  logger.error(
    `Critical error during startup: Configuration validation failed in nodemailerConfig for errorEmail: ${error.message}`
  );
  process.exit(1);
} else {
  logger.info(
    "Success: ErrorEmail Configuration validated in nodemailerConfig."
  );
}

const { error: hohohoMailError, value: hohohoEnvVars } =
  emailConfigValidator.validate(hohohoEnvVarsToValidate);

if (hohohoMailError) {
  logger.error(
    `Critical error during startup: Configuration validation failed in nodemailerConfig for hohohoEmail: ${hohohoMailError.message}`
  );
  process.exit(1);
} else {
  logger.info(
    "Success: HohohoEmail Configuration validated in nodemailerConfig."
  );
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  recipients: string[];
}

export const errorEmailConfig: EmailConfig = {
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: envVars.ZOHO_EMAIL,
    pass: envVars.ZOHO_PASSWORD,
  },
  recipients: [envVars.MY_EMAIL],
};

export const hohohoEmailConfig: EmailConfig = {
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: hohohoEnvVars.ZOHO_EMAIL,
    pass: hohohoEnvVars.ZOHO_PASSWORD,
  },
  recipients: [hohohoEnvVars.MY_EMAIL],
};
