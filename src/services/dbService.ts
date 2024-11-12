import pool from "../config/database";
import { logger } from "../utils/logger";

export const logInstanceToDB = async (
  instanceId: string,
  publicIp: string,
  projectName: string,
  launchTime: Date
) => {
  try {
    const projectResult = await pool.query(
      "SELECT id FROM projects WHERE name = $1",
      [projectName]
    );

    if (projectResult.rows.length === 0) {
      throw new Error("Project not found");
    }

    const projectId = projectResult.rows[0].id;

    const queryText = `
      INSERT INTO instances (instance_id, ip_address, project_id, launch_time)
      VALUES ($1, $2, $3, $4) RETURNING id;
    `;

    const result = await pool.query(queryText, [
      instanceId,
      publicIp,
      projectId,
      launchTime,
    ]);

    const newInstanceEntryId = result.rows[0].id;
    logger.info(
      `Instance with ID ${instanceId} logged to DB. Entry ID: ${newInstanceEntryId}`
    );
  } catch (err) {
    throw new Error(`Failed to log instance to DB: ${err}`);
  }
};

// TODO Refactor to use instanceId instead of projectName
export const logInstanceStatusToDB = async (
  instanceId: string,
  status: string
) => {
  try {
    const queryText = `
      INSERT INTO instance_statuses (instance_id, status, status_time)
      VALUES ($1, $2, NOW())
      RETURNING id;
    `;

    const result = await pool.query(queryText, [instanceId, status]);
    const newStatusEntryId = result.rows[0].id;
    logger.info(
      `Status "${status}" of instance with ID ${instanceId} logged to DB. Entry ID: ${newStatusEntryId}`
    );
  } catch (err) {
    throw new Error(`Failed to log instance status to DB: ${err}`);
  }
};

// TODO Refactor to use instanceId instead of projectName
export const logInstanceHealthToDB = async (
  healthStatus: string,
  responseTime: number,
  instanceId: string
) => {
  try {
    // TODO modify naming
    const actualInstanceId = await getLastInstanceIdByProjectName(instanceId);

    const validateInstanceQuery = `
    SELECT 1 FROM instances WHERE instance_id = $1 LIMIT 1;
  `;

    const validationResult = await pool.query(validateInstanceQuery, [
      actualInstanceId,
    ]);
    if (validationResult.rows.length === 0) {
      console.log("Instance ID does not exist in the database");
      throw new Error(
        `Instance ID ${actualInstanceId} does not exist in the database.`
      );
    }

    const queryText = `
    INSERT INTO health_checks (check_time, status, response_time, instance_id)
    VALUES (NOW(), $1, $2, $3)
    RETURNING id;
    `;

    const result = await pool.query(queryText, [
      healthStatus,
      responseTime,
      actualInstanceId,
    ]);
    const newHealthEntryId = result.rows[0].id;
    logger.info(
      `Health check for instance with ID ${actualInstanceId}, status "${healthStatus}" logged to DB. Entry ID: ${newHealthEntryId}`
    );
  } catch (err) {
    throw new Error(`Failed to log instance health to DB: ${err}`);
  }
};

export const getLastInstanceIdByProjectName = async (
  projectName: string
): Promise<string | null> => {
  try {
    const queryText = `
      SELECT instances.instance_id, instances.id
      FROM instances
      JOIN projects ON instances.project_id = projects.id
      WHERE projects.name = $1
      ORDER BY instances.launch_time DESC
      LIMIT 1;
    `;

    const result = await pool.query(queryText, [projectName]);
    if (result.rows.length === 0) {
      logger.info(
        `No instance found for project ${projectName} when querying DB`
      );
      throw new Error(`No instance found in DB for project ${projectName}`);
    }

    const lastInstanceId = result.rows[0].instance_id;
    const lastInstanceIdEntryId = result.rows[0].id;
    logger.info(
      `Last instance ID for project ${projectName}: ${lastInstanceId}. Entry ID: ${lastInstanceIdEntryId}`
    );
    return lastInstanceId;
  } catch (err) {
    throw new Error(
      `Failed to get last instance ID by project name "${projectName}": ${err}`
    );
  }
};

export const getLastInstanceStatus = async (
  instanceId: string
): Promise<{ status: string; statusTime: Date }> => {
  try {
    const queryText = `
      SELECT *
      FROM instance_statuses
      WHERE instance_id = $1
      ORDER BY status_time DESC
      LIMIT 1;
    `;

    const result = await pool.query(queryText, [instanceId]);
    if (result.rows.length === 0) {
      throw new Error("No status found for instance");
    }

    const status = result.rows[0].status;
    const statusTime = new Date(result.rows[0].status_time);
    const statusId = result.rows[0].id;

    logger.info(
      `Last status for instance with ID ${instanceId} at ${statusTime}: ${status}. Entry ID: ${statusId}`
    );
    return { status, statusTime };
  } catch (err) {
    throw new Error(`Failed to get last instance status: ${err}`);
  }
};