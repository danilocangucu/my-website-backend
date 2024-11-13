import { Response } from "express";
import nodemailer from "nodemailer";

import { hohohoLogger, logger } from "./logger";
import { errorEmailConfig } from "../config/nodemailerConfig";

const transporter = nodemailer.createTransport(errorEmailConfig);

export const handleValidationError = (res: Response, error: any): Response => {
  const message = error.details.map((detail: any) => detail.message).join(", ");
  logger.error(message);
  return res
    .status(400)
    .json({ message: "Your request didn't pass the validation." });
};

export const handleHohohoValidationError = (
  res: Response,
  error: any
): Response => {
  const message = error.details.map((detail: any) => detail.message).join(", ");
  hohohoLogger.error(`${message}`);
  return res.status(400).json({ message });
};

export const sendErrorEmail = async (
  errorMessage: string,
  errorStack: string
) => {
  try {
    await transporter.sendMail({
      from: errorEmailConfig.auth.user,
      to: errorEmailConfig.recipients.join(", "),
      subject: "Error!",
      text: `An error occurred:\n\n${errorMessage}\n\nStack trace:\n${errorStack}`,
    });
    logger.info("Error email sent successfully");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Nodemailer error: ${error.message}`);
      switch (error.message) {
        case "EAUTH":
          logger.error(
            "Authentication failed. Please check your email credentials."
          );
          break;
        case "ECONNECTION":
          logger.error("Connection error. Verify your SMTP server settings.");
          break;
        case "ETIMEDOUT":
          logger.error(
            "Connection timed out while attempting to send the email."
          );
          break;
        default:
          logger.error(`Unhandled Nodemailer error message: ${error.message}`);
      }
    } else if (error instanceof Error) {
      logger.error(
        `General error occurred while sending email: ${error.message}`
      );
    } else {
      logger.error(
        "An unknown error occurred while sending email: " + String(error)
      );
    }
  }
};
