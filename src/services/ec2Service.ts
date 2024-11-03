import { Response } from "express";
import { InstanceState, ProjectName } from "../types/ec2Types";
import { createPayload, fetchAmiId, handleEC2Action } from "../utils/amiHelper";
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";
import {
  logInstanceToDB,
  logInstanceStatusToDB,
  getLastInstanceIdByProjectName,
  getLastInstanceStatus,
  logInstanceHealthToDB,
} from "./dbService";

dotenv.config();

const TIMEOUT_DURATION = 3000;

const timeoutPromise = (duration: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout: Health check took too long."));
    }, duration);
  });
};

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

  logger.info(
    `Payload created for starting EC2 instance: ${JSON.stringify(payload)}`
  );

  const lambdaResponse = await handleEC2Action(payload, InstanceState.START);

  if (lambdaResponse.status !== 200) {
    return res.status(Number(lambdaResponse.status)).json({
      message: lambdaResponse.message,
    });
  }

  const responseBody = lambdaResponse.data;
  const instanceId = responseBody.instanceId;
  const publicIp = responseBody.publicIp;

  if (!instanceId || !publicIp) {
    logger.error(
      "Failed to parse response body:",
      JSON.stringify(responseBody)
    );
    return res.status(500).json({
      message: "Failed to parse response body. Please try again later.",
    });
  }

  const launchTime = new Date();

  try {
    // TODO Check why FKs with instance_id were not working
    await logInstanceToDB(instanceId, publicIp, projectName, launchTime);
    await logInstanceStatusToDB(instanceId, "starting");
  } catch (err) {
    return res.status(500).json({
      message: `Failed to log instance details. Error: ${
        (err as Error).message
      }`,
    });
  }

  return res
    .status(Number(lambdaResponse.status))
    .json({ message: lambdaResponse.message });
};

// TODO DB interactions for termination
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
  return handleEC2Action(payload, InstanceState.TERMINATE);
};

// TODO how could getEC2InstanceHealthService be refactored?
export const getEC2InstanceHealthService = async (
  projectName: ProjectName,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const projectHealthUrl = `https://${projectName}.danilocangucu.net/api/v1/health`;

  let lastInstanceId: string | null = null;
  let lastInstanceStatus: any;

  try {
    lastInstanceId = await getLastInstanceIdByProjectName(projectName);

    if (lastInstanceId) {
      lastInstanceStatus = await getLastInstanceStatus(lastInstanceId);
    }

    const requestStartingTime = new Date();

    const result = await Promise.race([
      axios.get(projectHealthUrl),
      timeoutPromise(TIMEOUT_DURATION),
    ]);

    const requestEndTime = new Date();
    const responseTime =
      requestEndTime.getTime() - requestStartingTime.getTime();

    if (
      (result as AxiosResponse).status === 200 &&
      (result as AxiosResponse).data === "OK"
    ) {
      logger.info(`Project ${projectName} is healthy`);
      await logInstanceHealthToDB("healthy", responseTime, projectName);

      if (
        lastInstanceId &&
        lastInstanceStatus &&
        lastInstanceStatus.status === "starting"
      ) {
        await logInstanceStatusToDB(lastInstanceId, "running");
      }

      return res
        .status(200)
        .json({ message: `Project ${projectName} is healthy` });
    } else {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

      if (
        lastInstanceId &&
        lastInstanceStatus &&
        lastInstanceStatus.status === "starting" &&
        lastInstanceStatus.statusTime > fiveMinutesAgo
      ) {
        await logInstanceHealthToDB(
          "unhealthy_starting",
          responseTime,
          projectName
        );
        await logInstanceStatusToDB(lastInstanceId, "unhealthy_starting");
        logger.warn(`Project ${projectName} is unhealthy but is starting`);
        return res.status(202).json({
          message: `Project ${projectName} is unhealthy but is starting`,
        });
      }

      if (
        lastInstanceId &&
        lastInstanceStatus &&
        lastInstanceStatus.status !== "terminated"
      ) {
        await logInstanceStatusToDB(lastInstanceId, "terminated");
      }
      await logInstanceHealthToDB("unhealthy", responseTime, projectName);
      return res
        .status(500)
        .json({ message: `Project ${projectName} is unhealthy` });
    }
  } catch (error) {
    const errorMessage = (error as any).message;

    if (errorMessage.includes("ECONNREFUSED")) {
      if (
        (lastInstanceStatus && lastInstanceStatus.status === "running") ||
        (lastInstanceStatus &&
          lastInstanceStatus.status === "unhealthy_starting")
      ) {
        await logInstanceHealthToDB("unhealthy_terminating", 0, projectName);
        if (lastInstanceId) {
          await logInstanceStatusToDB(lastInstanceId, "unhealthy_terminating");
          logger.warn(
            `EC2 instance might be starting for ${projectName}: ${errorMessage}`
          );
          return res.status(500).json({
            message: "EC2 instance is probably terminating.",
          });
        }
        // TODO if NOT lastInstanceId
      } else {
        logger.warn(
          `EC2 instance might be starting for ${projectName}: ${errorMessage}`
        );
        return res.status(202).json({
          message:
            "EC2 instance is starting. Please try again in a few minutes.",
        });
      }
    } else if (errorMessage.includes("No instance found in DB")) {
      return res.status(204).json({
        message: `No instance record found in DB for project ${projectName}`,
      });
    } else if (lastInstanceStatus && lastInstanceStatus.status === "starting") {
      await logInstanceHealthToDB("starting_unhealthy", 0, projectName);
      if (lastInstanceId) {
        await logInstanceStatusToDB(lastInstanceId, "starting_unhealthy");
        logger.warn(
          `EC2 instance might be still starting for ${projectName}: ${errorMessage}`
        );
        return res.status(202).json({
          message:
            "EC2 instance is still starting. Please try again in a few minutes.",
        });
      }
      // TODO if NOT (lastInstanceStatus && lastInstanceStatus.status === "starting")
    }

    logger.error(
      `Error fetching EC2 instance status for ${projectName}: ${errorMessage}`
    );
    return res
      .status(500)
      .json({ message: "Service unavailable. Please try again soon." });
  }
};