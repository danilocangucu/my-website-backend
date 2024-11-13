import nodemailer from "nodemailer";
import {
  errorEmailConfig,
  hohohoEmailConfig,
} from "../config/nodemailerConfig";
import { logger, hohohoLogger } from "../utils/logger";

const transporter = nodemailer.createTransport(errorEmailConfig);

export const sendErrorEmail = async (
  errorMessage: string,
  errorStack: string
) => {
  try {
    await transporter.sendMail({
      from: errorEmailConfig.auth.user,
      to: errorEmailConfig.recipients,
      subject: "Error!",
      text: `An error occurred:\n\n${errorMessage}\n\nStack trace:\n${errorStack}`,
    });
    logger.info("Error email sent successfully");
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to send error email: " + error.message);
    } else {
      logger.error("Failed to send error email: " + String(error));
    }
  }
};

export const sendHohohoEmailService = async (
  email: string,
  subject: string,
  text: string,
  html: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: hohohoEmailConfig.host,
      port: hohohoEmailConfig.port,
      secure: hohohoEmailConfig.secure,
      auth: {
        user: hohohoEmailConfig.auth.user,
        pass: hohohoEmailConfig.auth.pass,
      },
    });

    const mailOptions = {
      from: `"Ho! Ho! Ho!" <${hohohoEmailConfig.auth.user}>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    hohohoLogger.info(`Email sent successfully to ${email}: ${info.response}`);
  } catch (error) {
    if (error instanceof Error) {
      hohohoLogger.error(`Failed to send email to ${email}: ${error.message}`);
    } else {
      hohohoLogger.error(`Failed to send email to ${email}: ${error}`);
    }
    if (error instanceof Error) {
      throw new Error(`Email sending failed: ${error.message}`);
    } else {
      throw new Error(`Email sending failed: ${String(error)}`);
    }
  }
};
