import { MongoId } from "./MongoId";
import { StoreAssistantDocument } from "./StoreAssistant";
import { UserDocument } from "./User";
import { LoginMethod } from "./UserCredentials";
import { AdminDocument } from "./admin/AdminUser";

declare global {
  namespace Express {
    interface Request {
      loginMethod: LoginMethod;
      token: string;
      user: UserDocument | AdminDocument | StoreAssistantDocument;
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
