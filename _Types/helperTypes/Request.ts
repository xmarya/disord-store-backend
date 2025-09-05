import { MongoId } from "@Types/Schema/MongoId";
import { AdminDocument } from "@Types/Schema/Users/admin/AdminUser";
import { RegularUserDocument } from "@Types/Schema/Users/RegularUser";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";


declare global {
  namespace Express {
    interface Request {
      loginMethod: LoginMethod;
      token: string;
      user: RegularUserDocument | StoreOwnerDocument | AdminDocument | StoreAssistantDocument;
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
