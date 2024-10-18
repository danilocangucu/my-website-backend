import { Response } from "express";
import { InstanceState, ProjectName } from "../types/ec2Types";
import { getAmiIdByProjectName } from "../utils/amiHelper";
import { postToLambda } from "../utils/httpClient";
import dotenv from "dotenv";

dotenv.config();

export const startEC2InstanceService = async (
  projectName: ProjectName,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let amiId;
  try {
    amiId = getAmiIdByProjectName(projectName);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Project name")) {
        return res.status(400).json({ message: err.message });
      } else if (err.message.includes("AMI ID is undefined")) {
        return res.status(500).json({ message: err.message });
      }
    }
  }

  const payload = {
    amiKeyPair: {
      amiId,
      keyName: projectName,
    },
    instanceState: InstanceState.START,
  };

  try {
    const responseFromLambda = await postToLambda(payload);
    return res
      .status(responseFromLambda.status)
      .json({ message: responseFromLambda.data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Failed to start EC2 instance with amidId ${amiId}` });
  }
};
