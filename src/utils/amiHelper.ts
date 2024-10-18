import { InstanceState, ProjectName } from "../types/ec2Types";
import { Response } from "express";
import { postToLambda } from "./httpClient";

export const getAmiIdByProjectName = (projectName: ProjectName): string => {
  const amiIdMap: { [key in ProjectName]: string | undefined } = {
    [ProjectName.GOLDENRACK]: process.env.GOLDENRACK_AMI_ID,
    [ProjectName.LOVETOKENS]: process.env.LOVETOKENS_AMI_ID,
  };

  if (!amiIdMap[projectName]) {
    throw new Error(
      `Project name '${projectName}' is not valid. Please check the provided project name.`
    );
  }

  const amiId = amiIdMap[projectName];

  if (amiId === undefined) {
    throw new Error(
      `AMI ID is undefined for project '${projectName}'. Please ensure the corresponding environment variable is set.`
    );
  }

  return amiId;
};

export const fetchAmiId = (projectName: ProjectName): string | undefined => {
  try {
    return getAmiIdByProjectName(projectName);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
};

export const createPayload = (
  amiId: string,
  projectName: ProjectName,
  state: InstanceState
) => ({
  amiKeyPair: {
    amiId,
    keyName: projectName,
  },
  instanceState: state,
});

export const handleEC2Action = async (
  payload: any,
  res: Response,
  action: InstanceState
): Promise<Response<any, Record<string, any>>> => {
  try {
    const responseFromLambda = await postToLambda(payload);
    return res
      .status(responseFromLambda.status)
      .json({ message: responseFromLambda.data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Failed to ${action} EC2 instance` });
  }
};
