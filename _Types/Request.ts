import { MongoId } from "./MongoId";
import { UserDocument } from "./User";
import { AdminDocument } from "./admin/AdminUser";

declare global {
  namespace Express {
    interface Request {
      loginMethod: Record<"email", string> | Record<"phoneNumber", string>;
      token: string;
      user: UserDocument | AdminDocument; // NOTE: this might cause a type narrowing errors
      store: MongoId;
      plan: MongoId;
      isPlanPaid: boolean;
      planExpiryDate: Date;
      /* OLD CODE (kept for reference): 
      Model: mongoose.Model<mongoose.Document>;
      validatedModelId: string,
      */
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
