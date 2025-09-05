import { UserDocument } from "./Schema/Users/RegularUser";

export type NovuSubscriberData = Pick<UserDocument, "id" | "firstName" | "lastName" | "email" | "userType"> & Partial<Pick<UserDocument, "phoneNumber">>;
