import { Response } from "express";

import { generateVerificationCode } from "../utils/hohohoUtils";
import { sendHohohoEmailService } from "./emailsService";

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
    await sendApplicationCodeEmail(email, verificationCode);

    // Log the email and code to the database
    // await logApplicationToDB(email, verificationCode);

    return res
      .status(200)
      .send({ message: "Email sent successfully with the application code." });
  } catch (error) {
    console.error("Error in startApplicationService:", error);
    return res
      .status(500)
      .send({ message: "Failed send your email with the application code." });
  }
};
