import { UserDocument } from "./User";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument,
    }
  }
}