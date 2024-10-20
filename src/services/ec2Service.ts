import { Response } from "express";
import { InstanceState, ProjectName } from "../types/ec2Types";
import { createPayload, fetchAmiId, handleEC2Action } from "../utils/amiHelper";
import dotenv from "dotenv";
import axios from "axios";
import logger from "../utils/logger";

dotenv.config();

export const startEC2InstanceService = async (
  projectName: ProjectName,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let amiId;
  try {
    amiId = fetchAmiId(projectName);
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }

  const payload = createPayload(amiId!, projectName, InstanceState.START);
  return handleEC2Action(payload, res, InstanceState.START);
};

export const terminateEC2InstanceService = async (
  projectName: ProjectName,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let amiId;
  try {
    amiId = fetchAmiId(projectName);
  } catch (err) {
    logger.error(
      `Error fetching AMI ID for ${projectName}: ${(err as Error).message}`
    );
    return res
      .status(400)
      .json({ message: "Failed to fetch AMI ID. Please try again later." });
  }

  const payload = createPayload(amiId!, projectName, InstanceState.TERMINATE);
  return handleEC2Action(payload, res, InstanceState.TERMINATE);
};

export const getEC2InstanceHealthService = async (
  projectName: ProjectName,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const projectHealthUrl = `https://${projectName}.danilocangucu.net/api/v1/health`;

  try {
    const result = await axios.get(projectHealthUrl);

    if (result.status === 200 && result.data === "OK") {
      logger.info(`Project ${projectName} is healthy`);
      return res
        .status(200)
        .json({ message: `Project ${projectName} is healthy` });
    } else {
      logger.warn(`Project ${projectName} is unhealthy`);
      return res
        .status(500)
        .json({ message: `Project ${projectName} is unhealthy` });
    }
  } catch (error) {
    const errorMessage = (error as any).message;
    logger.error(
      `Error fetching EC2 instance status for ${projectName}: ${errorMessage}`
    );
    return res
      .status(500)
      .json({ message: "Service unavailable. Please try again soon." });
  }
};