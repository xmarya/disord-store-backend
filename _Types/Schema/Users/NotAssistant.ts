import { AllUsers } from "./AllUser";
import { StoreAssistantDocument } from "./StoreAssistant";


export type NotAssistant = Exclude<AllUsers, StoreAssistantDocument>