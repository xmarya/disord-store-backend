import mongoose, { Types } from "mongoose";
import { UserDocument } from "./User";
import { AdminDocument } from "./admin/AdminUser";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      token:string,
      user: UserDocument | AdminDocument, // NOTE: this might cause a type narrowing errors
      store: Types.ObjectId | string,
      plan:Types.ObjectId | string,
      Model: mongoose.Model<mongoose.Document>;
      validatedModelId: string,
      dateQuery: {
        dateFilter:{date: {$gte: Date, $lte: Date}},
        sortBy:any,
        sortOrder:"desc" | "asc"
      }
    }
  }
}