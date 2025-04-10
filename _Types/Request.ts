import { Types } from "mongoose";
import { UserDocument } from "./User";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument,
      store: Types.ObjectId | string
    }
  }
}