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
      return
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
    let statusCode = 400;
  
    if (errorMessage === "Store not found" || errorMessage === "Order not found") {
      statusCode = 404;
    } else if (errorMessage === "Internal server error") {
      statusCode = 500;
    }
  
    res.status(statusCode).json({
      status: statusCode === 500 ? "error" : "failed",
      message: errorMessage,
    });
  };