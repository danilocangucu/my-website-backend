import { Request, RequestHandler, Response } from "express";
import { startEC2Validator } from "../validators/startEC2Validator";
import { handleValidationError } from "../utils/errorHandler";
import { ProjectName } from "../types/ec2Types";
import { startEC2InstanceService } from "../services/ec2Service";

export const startEC2Instance: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { error, value } = startEC2Validator.validate(req.body);

  if (error) {
    handleValidationError(res, error);
    return;
  }

  const { projectName } = value as { projectName: ProjectName };

  await startEC2InstanceService(projectName, res);
};
