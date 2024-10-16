import axios from "axios";
import dotenv from "dotenv";

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

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error posting to Lambda function:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to communicate with Lambda function"
      );
    } else {
      console.error("Unexpected error posting to Lambda function:", error);
      throw new Error("Failed to communicate with Lambda function");
    }
  }
};
