import { StoreDocument } from "@Types/Store";
import { DomainEvent } from "./DomainEvent";


export interface StoreListFetched extends DomainEvent {
    type: "storeList-fetched",
    payload:{query:string, storesList:StoreDocument[]},
    occurredAt: Date,
}