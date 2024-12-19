import { InstanceState, ProjectName } from "../types/ec2Types";
import { postToLambda } from "./httpClient";
import { logger } from "./logger";

export const getAmiIdByProjectName = (projectName: ProjectName): string => {
  const amiIdMap: { [key in ProjectName]: string | undefined } = {
    [ProjectName.GOLDENRACK]: process.env.GOLDENRACK_AMI_ID,
    [ProjectName.LOVETOKENS]: process.env.LOVETOKENS_AMI_ID,
  };

  if (!amiIdMap[projectName]) {
    throw new Error(
      `Project '${projectName}' is not valid.
      Please check the provided project name.`
    );
  }

  const amiId = amiIdMap[projectName];

  if (amiId === undefined) {
    throw new Error(
      `AMI ID is undefined for project '${projectName}'.
      Please ensure the corresponding environment variable is set.`
    );
  }

  logger.info(`Fetched AMI ID for project ${projectName}: ${amiId}`);
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
  action: InstanceState
): Promise<any> => {
  try {
    const responseFromLambda = await postToLambda(payload);

    logger.info(
      `Handling EC2 action "${action}" done. Lambda response received with status: ${responseFromLambda.status}`
    );
    console.log("Returning response from lambda");
    return responseFromLambda;
  } catch (err) {
    logger.error(
      `Failed to ${action} EC2 instance.
      Payload: ${JSON.stringify(payload)}
      Error: ${(err as Error).message}`
    );
    throw new Error(
      `Failed to ${action} EC2 instance. Please try again later.`
    );
  }
};
