import { ProjectName } from "../types/ec2Types";

export const getAmiIdByProjectName = (projectName: ProjectName): string => {
  const amiIdMap: { [key in ProjectName]: string | undefined } = {
    [ProjectName.GOLDENRACK]: process.env.GOLDENRACK_AMI_ID,
    [ProjectName.LOVETOKENS]: process.env.LOVETOKENS_AMI_ID,
  };

  console.log(`AMI ID map: ${JSON.stringify(amiIdMap)}`);

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
