import { Response } from "express";
import { InstanceState, ProjectName } from "../types/ec2Types";
import { createPayload, fetchAmiId, handleEC2Action } from "../utils/amiHelper";
import dotenv from "dotenv";

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
    return res.status(400).json({ message: (err as Error).message });
  }

  const payload = createPayload(amiId!, projectName, InstanceState.TERMINATE);
  return handleEC2Action(payload, res, InstanceState.TERMINATE);
};