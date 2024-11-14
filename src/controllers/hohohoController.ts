import { Request, Response, RequestHandler, NextFunction } from "express";

import { registerApplicationValidator } from "../validators/hohohoValidators/registerApplicationValidator";
import { handleHohohoValidationError } from "../utils/errorHandler";
import {
  loginApplicationService,
  registerApplicationService,
  getApplicationService,
  postApplicationService,
} from "../services/hohohoServices";
import { loginApplicationValidator } from "../validators/hohohoValidators/loginApplicationValidator";
import { applicationDataValidator } from "../validators/hohohoValidators/applicationDataValidator";

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

export const getApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { applicationInitiationId } = (req as any).auth;

  // TODO validation for applicationInitiationId?

  await getApplicationService(applicationInitiationId, res);
};

export const postApplication: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { applicationInitiationId } = (req as any).auth;

  const applicationData = { ...req.body, applicationInitiationId };

  const { error, value: validatedApplicationData } =
    applicationDataValidator.validate(applicationData);

  if (error) {
    handleHohohoValidationError(res, error);
    return;
  }

  await postApplicationService(
    applicationInitiationId,
    validatedApplicationData,
    res
  );
};