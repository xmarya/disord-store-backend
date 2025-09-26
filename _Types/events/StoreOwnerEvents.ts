import { MongoId } from "@Types/Schema/MongoId";
import { OutboxEvent } from "./OutboxEvents";


export interface StoreOwnerDeletedEvent extends OutboxEvent {
    type: "storeOwner-deleted",
    payload:{
        storeId:MongoId,
        storeOwnerId:MongoId
    }
}