import type { Request } from "express";
import mongoose from "mongoose";
import { DOCS_PER_PAGE } from "../../_constants/numbers";
import { QueryParams } from "@Types/Request";


export function buildQuery<T extends mongoose.Document>(request: Request<{}, {}, {}, QueryParams>, Model: mongoose.Model<T>) {
  // STEP 1) convert the query from JSON object to a normal JavaScript object in order to manipulate it:
  const rawQuery = { ...request.query };
  let stringifiedQuery: any = JSON.stringify(rawQuery);

  stringifiedQuery = stringifiedQuery.replace(/\b(gte?|lte?)\b/g, (match: string) => `$${match}`);
  // STEP 2) fetch the data based on the query:
  let query = Model.find(JSON.parse(stringifiedQuery));

  // STEP 3) SORTING:
  if (typeof request.query.sort === "string") {
    const sortBy = request.query.sort?.split(",").join(" ");
    query = query.sort(sortBy); // sort() is one of query prototype methods in mongoose.
  } else {
    query = query.sort("-createdAt"); // default sorting option
  }

  // STEP 4) LIMITING FIELDS:
  if (typeof request.query.fields === "string") {
    const limitFields = request.query.fields?.split(",").join(" ");
    query.select(limitFields);
  }

  // STEP 5) PAGINATION AND LIMITATION:

  const page = +(request.query.page ?? 1);
  const limitResultPerPage = +(request.query?.limit ?? DOCS_PER_PAGE);
  // if I want page 3 (from element 31 - 46),
  // then it will be 2 * 15 = 30 elements to skip .
  const skip = (page - 1) * limitResultPerPage;

  query = query.skip(skip).limit(limitResultPerPage);

  return query;
}
