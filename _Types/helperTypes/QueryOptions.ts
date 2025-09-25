import mongoose from "mongoose";
import { KnownKeys } from "./TypeKeys";

export type QueryOptions<T> = {
  condition?: mongoose.RootFilterQuery<T>;
  select?: Array<KnownKeys<T> | `-${KnownKeys<T>}`>;
  session?: mongoose.ClientSession | null; // mongoose session is null be default, not undefined.
};
