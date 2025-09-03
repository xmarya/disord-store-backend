import { UserDocument } from "./User";


export type NovuSubscriberData = Pick<UserDocument, "id" | "firstName" | "lastName"| "email" | "userType"> & Partial<Pick<UserDocument, "phoneNumber">>