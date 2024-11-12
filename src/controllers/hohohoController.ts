import { Request, Response, RequestHandler } from "express";

import { startApplicationValidator } from "../validators/hohohoValidators/startApplicationValidator";
import { handleHohohoValidationError } from "../utils/errorHandler";
import { startApplicationService } from "../services/hohohoServices";

export const startApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = startApplicationValidator.validate(req.body);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  await startApplicationService(value.email, res);
};
