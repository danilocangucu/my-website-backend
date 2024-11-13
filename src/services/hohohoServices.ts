import { Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET, JWT_EXPIRY } from "../config/hohohoConfig";
import { hohohoLogger } from "../utils/logger";
import {
  generateVerificationCode,
  sanitizeApplicationDetails,
} from "../utils/hohohoUtils";
import { sendHohohoEmailService } from "./emailsService";
import {
  checkApplicationInitiationExistsInDB,
  createEmptyApplicationDetails,
  loadApplicationDetailsFromDB,
  loadApplicationInitiationFromDB,
  logApplicationInitiationToDB,
  updateApplicationStatusToActive,
} from "./hohohoDbService";
import { ApplicationInitiation } from "../types/hohohoTypes";

export const sendApplicationCodeEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  const subject = "Your Application Code";
  const text = `Here is your application code: ${verificationCode}`;
  const html = `<p>Here is your application code: <strong>${verificationCode}</strong></p>`;

  await sendHohohoEmailService(email, subject, text, html);
};

export const registerApplicationService = async (
  email: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const verificationCode = generateVerificationCode();

  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await logApplicationInitiationToDB(email, verificationCode, expiresAt);

    await sendApplicationCodeEmail(email, verificationCode);

    return res
      .status(200)
      .send({ message: "Email sent successfully with the application code." });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "An active or pending application initiation already exists"
      )
    ) {
      return res.status(400).send({
        message:
          "An application code has been already sent to your email. If you don’t see it, check your spam folder. You can request a new one in 15 minutes.",
      });
    }

    hohohoLogger.error("Error in registerApplicationService:", error);
    return res.status(500).send({
      message:
        "Failed to send your email with the application code. Please try again later.",
    });
  }
};

// TODO refactor loginApplicationService
export const loginApplicationService = async (
  email: string,
  code: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const applicationExists = await checkApplicationInitiationExistsInDB(
      email,
      code
    );

    if (!applicationExists) {
      return res.status(404).send({
        message:
          "No pending or active application found for this email and code. Please start a new application.",
      });
    }

    const applicationInitiation: ApplicationInitiation | null =
      await loadApplicationInitiationFromDB(email, code);

    if (!applicationInitiation) {
      return res.status(404).send({
        message:
          "Application could not be found. Please start a new application.",
      });
    }

    if (
      applicationInitiation.status !== "active" &&
      applicationInitiation.status !== "pending"
    ) {
      hohohoLogger.error(
        `Unexpected application status "${applicationInitiation.status}" from email ${email} while logging in.`
      );
      return res.status(400).send({
        message:
          "There was an issue with your application. This has been logged and will be investigated. Please contact Danilo for support.",
      });
    }

    if (applicationInitiation.status === "pending") {
      await createEmptyApplicationDetails(applicationInitiation.id);
      hohohoLogger.info(
        `Successful function call to createEmptyApplicationDetails with applicationInitiationId ${applicationInitiation.id}`
      );

      await updateApplicationStatusToActive(applicationInitiation.id);
      hohohoLogger.info(
        `Successful function call to updateApplicationStatusToActive with applicationInitiationId ${applicationInitiation.id}`
      );
    }

    const tokenPayload = {
      applicationInitiationId: applicationInitiation.id,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    hohohoLogger.info(`Application login successful for email: ${email}`);

    return res.status(200).send({
      message: "Login successful. Loading your application...",
      token,
    });
  } catch (error) {
    hohohoLogger.error(`Failed to login application: ${error}`);
    return res.status(500).send({
      message: "Failed to login. Please try again.",
    });
  }
};

export const loadApplicationService = async (
  applicationInitiationId: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const applicationDetails = await loadApplicationDetailsFromDB(
      Number(applicationInitiationId)
    );

    if (!applicationDetails) {
      hohohoLogger.warn(
        `Application details not found for id ${applicationInitiationId}`
      );
      return res.status(404).send({
        message:
          "Application details not found. Please contact Danilo for support.",
      });
    }

    const sanitizedApplicationDetails =
      sanitizeApplicationDetails(applicationDetails);

    hohohoLogger.info(
      `Application successfully loaded & sanitized for id ${applicationInitiationId}. Sending response.`
    );
    return res.status(200).send({
      message: "Application successfully loaded.",
      application: sanitizedApplicationDetails,
    });
  } catch (error) {
    return res.status(500).send({
      message:
        "Failed to load your application. Please contact Danilo for support.",
    });
  }
};