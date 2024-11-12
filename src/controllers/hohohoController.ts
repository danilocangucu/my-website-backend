import { Request, Response, RequestHandler } from "express";

import { startApplicationValidator } from "../validators/hohohoValidators/startApplicationValidator";
import { handleHohohoValidationError } from "../utils/errorHandler";
import { generateVerificationCode } from "../utils/hohohoUtils";
import { sendApplicationCodeEmail } from "../services/hohohoServices";

export const startApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = startApplicationValidator.validate(req.body);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  const verificationCode = generateVerificationCode();

  try {
    await sendApplicationCodeEmail(value.email, verificationCode);

    res
      .status(200)
      .send({ message: "Email sent successfully with the application code." });
  } catch (err) {
    console.error("Error while sending email:", err);
    res
      .status(500)
      .send({ message: "Failed to send email, please try again." });
  }
};
