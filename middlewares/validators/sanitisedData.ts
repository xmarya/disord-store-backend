import type { Request, Response, NextFunction } from "express";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { AppError } from "@Types/ResultTypes/errors/AppError";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function deepSanitise(data: any): any {
  if (typeof data === "string") return DOMPurify.sanitize(data);
  if (Array.isArray(data)) return data.map(deepSanitise);
  if (typeof data === "object" && data !== null) {
    const result: any = {};
    for (const key in data) {
      result[key] = deepSanitise(data[key]);
    }
    return result;
  }
  return data; // numbers, booleans, etc.
}

export default function sanitisedData(request: Request, response: Response, next: NextFunction) {
  const sanitisedData = deepSanitise(request.body);
  if (sanitisedData === null || sanitisedData === undefined) return next(new AppError(400, "مدخلات خاطئة"));

  next();
}
