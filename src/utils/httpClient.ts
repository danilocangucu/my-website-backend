import axios from "axios";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const LAMBDA_FUNCTION_URL = process.env.LAMBDA_FUNCTION_URL;

export const postToLambda = async (payload: any) => {
  try {
    if (!LAMBDA_FUNCTION_URL) {
      throw new Error("LAMBDA_FUNCTION_URL is not defined");
    }

    const response = await axios.post(LAMBDA_FUNCTION_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    logger.info(`Payload posted to Lambda: ${JSON.stringify(payload)}
      Response.data from Lambda: ${JSON.stringify(response.data)}`);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // handle better known errors like: 400 –  deleting a non-existent resource
      throw new Error("Failed to communicate with Lambda function: " + error);
    } else {
      throw new Error(
        "An unexpected error occurred while communicating with the Lambda function: " +
          error
      );
    }
  }
};
