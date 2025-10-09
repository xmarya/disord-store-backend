import { MongoId } from "@Types/Schema/MongoId";
import { AllUsers } from "@Types/Schema/Users/AllUser";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import { ParsedFile } from "./Files";


declare global {
  namespace Express {
    interface Request {
      loginMethod: LoginMethod;
      token: string;
      user: AllUsers;
      emailConfirmed: boolean;
      store: MongoId;
      plan: MongoId;
      isPlanPaid: boolean;
      planExpiryDate: Date;
      dateQuery: {
        dateFilter: { date: { $gte: Date; $lte: Date } };
        sortBy: any;
        sortOrder: "desc" | "asc";
      };
      parsedFile:Array<ParsedFile>
    }
  }
}

export type QueryParams = {
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  [key: string]: any; // for extra filtering fields
};
