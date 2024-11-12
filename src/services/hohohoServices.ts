import { Response } from "express";

import { generateVerificationCode } from "../utils/hohohoUtils";
import { sendHohohoEmailService } from "./emailsService";
import { loadApplicationFromDB, logApplicationToDB } from "./hohohoDbService";

export const sendApplicationCodeEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  const subject = "Your Application Code";
  const text = `Here is your application code: ${verificationCode}`;
  const html = `<p>Here is your application code: <strong>${verificationCode}</strong></p>`;

  await sendHohohoEmailService(email, subject, text, html);
};

export const startApplicationService = async (
  email: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const verificationCode = generateVerificationCode();

  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await logApplicationToDB(email, verificationCode, expiresAt);

    await sendApplicationCodeEmail(email, verificationCode);

    return res
      .status(200)
      .send({ message: "Email sent successfully with the application code." });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("An active or pending application already exists")
    ) {
      return res.status(400).send({
        message:
          "A code has been already sent to your email. If you don’t see it, check your spam folder. You can request a new one in 15 minutes.",
      });
    }

    console.error("Error in startApplicationService:", error);
    return res.status(500).send({
      message:
        "Failed to send your email with the application code. Please try again later.",
    });
  }
};

export const loadApplicationService = async (
  email: string,
  code: string,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const application = await loadApplicationFromDB(email, code);

    if (!application) {
      return res
        .status(404)
        .send({
          message:
            "No active or pending application found with this email and code.",
        });
    }

    return res.status(200).send({
      message: "Application successfully loaded.",
      application,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Failed to load your application. Please try again." });
  }
};