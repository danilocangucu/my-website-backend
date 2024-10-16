import { Response } from "express";

export const handleValidationError = (res: Response, error: any): Response => {
  const message = error.details.map((detail: any) => detail.message).join(", ");
  return res.status(400).json({ message });
};
