import { z } from "zod";
import { Response } from "express";

export const RoundToTwo = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  export const HandleErrorResponse = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: "failed",
        message: "Validation failed",
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
      });
    }

    if (error instanceof Error && error.name === "MongoServerError") {
      if ((error as any).code === 11000) {
        res.status(400).json({
          status: "failed",
          message: "Coupon code already exists",
        });
        return;
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    const statusCode = errorMessage === "Store not found" ? 404 : 400;
  
    res.status(statusCode).json({
      status: "failed",
      message: errorMessage,
    });
  };