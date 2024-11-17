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

export const getApplicationInitiationFromDB = async (
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

    hohohoLogger.info(
      `Application initiation found for email ${email} with right code`
    );
    return result.rows[0];
  } catch (err) {
    hohohoLogger.error(`Failed to get application initiation from DB: ${err}`);
    throw new Error(`Failed to get application initiation from DB: ${err}`);
  }
};

export const createEmptyApplicationDetails = async (
  applicationInitiationId: number
): Promise<void> => {
  try {
    // TODO email should be added when creating empty application

    const queryText = `
      INSERT INTO application_details 
        (
          application_initiation_id,
          full_name,
          email_address,
          phone_number,
          preferred_language,
          about_you_work,
          about_project_context,
          website_reason,
          website_main_description,
          website_main_feature,
          website_additional_feature1,
          website_additional_feature2,
          website_additional_feature3,
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
          updated_at
        )
      VALUES 
        (
          $1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
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

export const getApplicationDetailsFromDB = async (
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
      `Got Application details for application initiation ID ${applicationInitiationId}`
    );
    return result.rows[0];
  } catch (err) {
    hohohoLogger.error(`Failed to get application details from DB: ${err}`);
    throw new Error(`Failed to get application details from DB: ${err}`);
  }
};

export const updateApplicationDetailsInDB = async (
  applicationInitiationId: number,
  // TODO fix type for applicationData in updateApplicationInDB
  applicationData: any
) => {
  try {
    const updateQuery = `
      UPDATE application_details
      SET
        full_name = $2,
        email_address = $3,
        phone_number = $4,
        preferred_language = $5,
        about_you_work = $6,
        about_project_context = $7,
        website_reason = $8,
        website_main_description = $9,
        website_main_feature = $10,
        website_additional_feature1 = $11,
        website_additional_feature2 = $12,
        website_additional_feature3 = $13,
        website_content_material = $14,
        is_complete = $15
      WHERE application_initiation_id = $1
      RETURNING *;
    `;

    const result = await hohohoPool.query(updateQuery, [
      applicationInitiationId,
      applicationData.personalInformation.fullName,
      applicationData.personalInformation.emailAddress,
      applicationData.personalInformation.phoneNumber,
      applicationData.personalInformation.preferredLanguage,
      applicationData.aboutYou.work,
      applicationData.aboutYou.projectContext,
      applicationData.aboutYourWebsite.websiteReason,
      applicationData.aboutYourWebsite.websiteMainDescription,
      applicationData.aboutYourWebsite.websiteMainFeature,
      applicationData.aboutYourWebsite.websiteAdditionalFeatures.feature1,
      applicationData.aboutYourWebsite.websiteAdditionalFeatures.feature2,
      applicationData.aboutYourWebsite.websiteAdditionalFeatures.feature3,
      applicationData.aboutYourWebsite.websiteContentMaterial,
      applicationData.isComplete,
    ]);

    if (result.rows.length === 0) {
      hohohoLogger.error(
        `No application found to update with initiation ID ${applicationInitiationId}`
      );
      throw new Error(
        `No application found to update with initiation ID ${applicationInitiationId}`
      );
    }

    hohohoLogger.info(
      `Updated application details for initiation ID ${applicationInitiationId}`
    );
    return result.rows[0]; // Return the updated application details
  } catch (err) {
    hohohoLogger.error(`Failed to update application: ${err}`);
    throw new Error(`Failed to update application: ${err}`);
  }
};
