import { AllUsers } from "@Types/Schema/Users/AllUser";

export type NovuSubscriberData = Pick<AllUsers, "id" | "firstName" | "lastName" | "email" | "userType"> & Partial<Pick<AllUsers, "phoneNumber">>;
