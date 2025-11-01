import { NextFunction, Request, Response } from "express";

// Example middleware (TypeScript-safe)
export function setResponseHeader(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Vary");
  res.removeHeader("Access-Control-Allow-Credentials");
  res.setHeader("X-Powered-By", "Express + TypeScript");

  next();
}
