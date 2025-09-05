import { AdminDocument } from "./admin/AdminUser";
import { RegularUserDocument } from "./RegularUser";
import { StoreAssistantDocument } from "./StoreAssistant";
import { StoreOwnerDocument } from "./StoreOwner";


export type AllUsers = RegularUserDocument | StoreOwnerDocument | StoreAssistantDocument | AdminDocument