import nodemailer from "nodemailer";
import errorEmailConfig from "../config/nodemailerConfig";
import logger from "../utils/logger";

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
