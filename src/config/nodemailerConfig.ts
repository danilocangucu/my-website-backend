import dotenv from "dotenv";
import { errorEmailConfigValidator } from "../validators/errorEmailConfigValidator";
import logger from "../utils/logger";

dotenv.config();

const envVarsToValidate = {
  ZOHO_EMAIL: process.env.ZOHO_EMAIL,
  ZOHO_PASSWORD: process.env.ZOHO_PASSWORD,
  MY_EMAIL: process.env.MY_EMAIL,
};

const { error, value: envVars } =
  errorEmailConfigValidator.validate(envVarsToValidate);

if (error) {
  logger.error(
    `Critical error during startup: Configuration validation failed in nodemailerConfig: ${error.message}`
  );
  process.exit(1);
} else {
  logger.info(
    "Application started successfully: Configuration validated in nodemailerConfig."
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

const errorEmailConfig: EmailConfig = {
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: envVars.ZOHO_EMAIL,
    pass: envVars.ZOHO_PASSWORD,
  },
  recipients: [envVars.MY_EMAIL],
};

export default errorEmailConfig;
