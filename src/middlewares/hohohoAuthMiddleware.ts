import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/hohohoConfig";
import { hohohoLogger } from "../utils/logger";

export const hohohoAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    hohohoLogger.warn(
      "Authorization header is missing or improperly formatted."
    );
    res.status(401).send({
      message:
        "Authentication failed: Token verification unsuccessful or token has expired.",
    });
    return;
  }

  const token = authHeader!.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    (req as any).auth = decoded as {
      email: string;
      applicationInitiationId: string;
    };

    next();
  } catch (error) {
    const errorMessage = (error as Error).message;
    hohohoLogger.error(`JWT verification failed for Hohoho: ${errorMessage}`);
    res.status(401).send({
      message:
        "Authentication error: Unable to validate the provided token. Please contact Danilo for support.",
    });
    return;
  }
};
