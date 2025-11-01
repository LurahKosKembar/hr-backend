import { Response } from "express";
import { formatAPIResponseDatetime } from "./formatDate.js";

/**
 * Sends a standardized success response to the client.
 */
export function successResponse(
  res: Response,
  customStatus: string,
  message: string,
  data: unknown,
  httpStatusCode: number = 200,
  dataKey: string = "data"
) {
  const responseBody: Record<string, unknown> = {
    status: customStatus,
    message: message,
    datetime: formatAPIResponseDatetime(),
  };

  // Add the data payload using the specified key
  if (data !== null && data !== undefined) {
    responseBody[dataKey] = data;
  }

  return res.status(httpStatusCode).json(responseBody);
}

/**
 * Sends a standardized error response to the client.
 */
export function errorResponse(
  res: Response,
  customStatus: string,
  message: string,
  httpStatusCode: number = 400,
  errorDetails: unknown = null
) {
  const responseBody: Record<string, unknown> = {
    status: customStatus,
    message: message,
    datetime: formatAPIResponseDatetime(),
  };

  if (errorDetails !== null && errorDetails !== undefined) {
    responseBody.errors = errorDetails;
  }

  return res.status(httpStatusCode).json(responseBody);
}
