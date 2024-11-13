import { Request, Response, RequestHandler, NextFunction } from "express";

import { registerApplicationValidator } from "../validators/hohohoValidators/registerApplicationValidator";
import { handleHohohoValidationError } from "../utils/errorHandler";
import {
  loginApplicationService,
  registerApplicationService,
  loadApplicationService,
} from "../services/hohohoServices";
import { loginApplicationValidator } from "../validators/hohohoValidators/loginApplicationValidator";

export const registerApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = registerApplicationValidator.validate(req.body);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  await registerApplicationService(value.email, res);
};

export const loginApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = loginApplicationValidator.validate(req.body);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  const { email, code } = value;

  await loginApplicationService(email, code, res);
};

export const loadApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { applicationInitiationId } = (req as any).auth;

  await loadApplicationService(applicationInitiationId, res);
};
