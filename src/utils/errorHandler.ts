import { Response } from "express";
import logger from "./logger";

export const handleValidationError = (res: Response, error: any): Response => {
  const message = error.details.map((detail: any) => detail.message).join(", ");
  logger.error(message);
  return res
    .status(400)
    .json({ message: "Your request didn't pass the validation." });
};
