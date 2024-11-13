import dotenv from "dotenv";

import { jwtEnvsValidator } from "../validators/hohohoValidators/jwtEnvsValidator";
import { hohohoLogger } from "../utils/logger";

dotenv.config();

const jwtEnvVars = {
  HOHOHO_JWT_SECRET: process.env.HOHOHO_JWT_SECRET,
  HOHOHO_JWT_EXPIRY: process.env.HOHOHO_JWT_EXPIRY,
};

const { error, value: validatedJwtEnvVars } =
  jwtEnvsValidator.validate(jwtEnvVars);

if (error) {
  hohohoLogger.error(
    `Critical error during startup: JWT configuration validation failed: ${error.message}`
  );
  process.exit(1);
} else {
  hohohoLogger.info("Success: JWT Configuration from Hohoho is validated.");
}

export const JWT_SECRET = validatedJwtEnvVars.HOHOHO_JWT_SECRET as string;
export const JWT_EXPIRY = validatedJwtEnvVars.HOHOHO_JWT_EXPIRY as string;
