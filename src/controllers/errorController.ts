import { Request, Response, RequestHandler } from "express";
import { sendErrorEmail } from "../utils/errorHandler";
import logger from "../utils/logger";

export const reportError: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { errorMessage, errorStack } = req.body;

  // TODO use Joi to validate the request body
  if (!errorMessage || !errorStack) {
    res.status(400).json({ message: "Error message and stack are required." });
    return;
  }

  try {
    await sendErrorEmail(errorMessage, errorStack);
    res.status(200).json({ message: "Error reported successfully." });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to report error: ${error.message}`);
    } else {
      logger.error("Failed to report error; not an instance of Error:", error);
    }
    res.status(500).json({ message: "Failed to report error." });
  }
};
