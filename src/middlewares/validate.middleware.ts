import { Request, Response, NextFunction } from "express";

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: "Request body is required",
        required: requiredFields,
      });
      return;
    }

    const missingFields = requiredFields.filter(
      (field) => !req.body[field]
    );

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: missingFields,
      });
      return;
    }

    next();
  };
};