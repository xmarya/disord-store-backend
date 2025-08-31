import { MongoId } from "@Types/MongoId";
import { DomainEvent } from "./DomainEvent";


export interface CategoryUpdateEvent extends DomainEvent {
    type: "category.updated",
    payload:{
        categories:Array<MongoId>,
        productId:MongoId
    },
    occurredAt: Date;
}