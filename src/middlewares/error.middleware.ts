import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("🔥 ERROR:", err);

  res.status(statusCode).json({
    success: false,
    message,
  });
};