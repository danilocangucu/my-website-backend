import hohohoPool from "../config/hohohoDatabase";
import { hohohoLogger } from "../utils/logger";

export const logApplicationInitiationToDB = async (
  email: string,
  verificationCode: string,
  expiresAt: Date
): Promise<void> => {
  try {
    const checkQuery = `
      SELECT id FROM application_initiations
      WHERE email = $1 AND status IN ('pending', 'active');
    `;

    const checkResult = await hohohoPool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      throw new Error(
        `An active or pending application initiation already exists for the email: ${email}`
      );
    }

    const insertQuery = `
      INSERT INTO application_initiations (email, code, expires_at)
      VALUES ($1, $2, $3) RETURNING id;
    `;

    const result = await hohohoPool.query(insertQuery, [
      email,
      verificationCode,
      expiresAt,
    ]);

    const newApplicationId = result.rows[0].id;

    hohohoLogger.info(
      `Application initiation with email ${email} and code logged to DB. Entry ID: ${newApplicationId}`
    );
  } catch (err) {
    hohohoLogger.error(`Failed to log application initiation to DB: ${err}`);
    throw new Error(`Failed to log application initiation to DB: ${err}`);
  }
};

export const checkApplicationInitiationExistsInDB = async (
  email: string,
  code: string
) => {
  try {
    const queryText = `
      SELECT 1 FROM application_initiations
      WHERE email = $1 AND code = $2 AND (status = 'pending' OR status = 'active')
      LIMIT 1;  -- We only need to check if at least one exists
    `;

    const result = await hohohoPool.query(queryText, [email, code]);

    // If result.rows.length > 0, an application exists with this email and code
    if (result.rows.length > 0) {
      hohohoLogger.info(
        `Application initiation exists for email ${email} and code ${code}`
      );
      return true; // Application found
    }

    hohohoLogger.info(
      `No active or pending application initiation found for email ${email} and code ${code}`
    );
    return false; // No application found
  } catch (err) {
    hohohoLogger.error(
      `Failed to check application initiation existence: ${err}`
    );
    throw new Error(`Failed to check application initiation existence: ${err}`);
  }
};

export const loadApplicationInitiationFromDB = async (
  email: string,
  code: string
) => {
  try {
    const queryText = `
      SELECT * FROM application_initiations
      WHERE email = $1 AND code = $2 AND (status = 'pending' OR status = 'active');
    `;

    const result = await hohohoPool.query(queryText, [email, code]);

    if (result.rows.length === 0) {
      hohohoLogger.error(
        `No application initiation found for email ${email} with right code`
      );
      return null;
    }

    hohohoLogger.info(`Application initiation found for email with right code`);
    return result.rows[0];
  } catch (err) {
    hohohoLogger.error(`Failed to load application initiation from DB: ${err}`);
    throw new Error(`Failed to load application initiation from DB: ${err}`);
  }
};

export const createEmptyApplicationDetails = async (
  applicationInitiationId: number
): Promise<void> => {
  try {
    const queryText = `
      INSERT INTO application_details 
        (application_initiation_id, full_name, email_address, phone_number, preferred_language, website_url, website_description, website_features)
      VALUES 
        ($1, '', '', '', '', '', '', '') 
      RETURNING id;
    `;
    const result = await hohohoPool.query(queryText, [applicationInitiationId]);
    const applicationDetailsId = result.rows[0].id;
    hohohoLogger.info(
      `Empty application details created for application initiation ID ${applicationInitiationId} with details ID ${applicationDetailsId}`
    );
  } catch (err) {
    hohohoLogger.error(
      `Failed to create empty application details for application initiation ID ${applicationInitiationId}: ${err}`
    );
    throw new Error(
      `Failed to create empty application details for application initiation ID ${applicationInitiationId}`
    );
  }
};

export const updateApplicationStatusToActive = async (
  applicationInitiationId: number
): Promise<void> => {
  try {
    const queryText = `
      UPDATE application_initiations
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
      RETURNING id, status;
    `;

    const result = await hohohoPool.query(queryText, [applicationInitiationId]);

    if (result.rows.length === 0) {
      hohohoLogger.error(
        `Failed to update status for application initiation with ID ${applicationInitiationId}. It may not be pending.`
      );
      throw new Error(
        `Application initiation not found or not in pending status.`
      );
    }

    hohohoLogger.info(
      `Successfully updated application initiation ID ${applicationInitiationId} to 'active'.`
    );
  } catch (err) {
    hohohoLogger.error(
      `Error updating application initiation ID ${applicationInitiationId} to 'active': ${err}`
    );
    throw new Error(`Failed to update application status: ${err}`);
  }
};

export const loadApplicationDetailsFromDB = async (
  applicationInitiationId: number
) => {
  try {
    const queryText = `
      SELECT * FROM application_details
      WHERE application_initiation_id = $1;
    `;
    const result = await hohohoPool.query(queryText, [applicationInitiationId]);

    if (result.rows.length === 0) {
      hohohoLogger.error(
        `No application details found for application initiation ID ${applicationInitiationId}`
      );
      return null;
    }

    hohohoLogger.info(
      `Application details loaded for application initiation ID ${applicationInitiationId}`
    );
    return result.rows[0];
  } catch (err) {
    hohohoLogger.error(`Failed to load application details from DB: ${err}`);
    throw new Error(`Failed to load application details from DB: ${err}`);
  }
};