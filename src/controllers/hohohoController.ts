import { Request, Response, RequestHandler } from "express";

import { startApplicationValidator } from "../validators/hohohoValidators/startApplicationValidator";
import { handleHohohoValidationError } from "../utils/errorHandler";
import {
  loadApplicationService,
  startApplicationService,
} from "../services/hohohoServices";
import { loadApplicationValidator } from "../validators/hohohoValidators/loadApplicationValidator";

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

export const loadApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = loadApplicationValidator.validate(req.body);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  const { email, code } = value;

  await loadApplicationService(email, code, res);
};
