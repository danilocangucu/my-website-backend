import hohohoPool from "../config/hohohoDatabase";
import { hohohoLogger } from "../utils/logger";

export const logApplicationToDB = async (
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
        `An active or pending application already exists for the email: ${email}`
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

export const loadApplicationFromDB = async (email: string, code: string) => {
  try {
    const queryText = `
        SELECT * FROM application_initiations
        WHERE email = $1 AND code = $2 AND (status = 'pending' OR status = 'active');
      `;

    const result = await hohohoPool.query(queryText, [email, code]);

    if (result.rows.length === 0) {
      hohohoLogger.error(
        `No application found for email ${email} and code ${code}`
      );
      return null;
    }

    hohohoLogger.info(`Application found for email ${email} and code ${code}`);
    return result.rows[0];
  } catch (err) {
    hohohoLogger.error(`Failed to load application from DB: ${err}`);
    throw new Error(`Failed to load application from DB: ${err}`);
  }
};
