import { DomainEvent } from "./DomainEvent";


export interface QueryResultsFetched extends DomainEvent {
    type: "queryResults-fetched",
    payload:{key:string, queryResults:unknown[]},
    occurredAt: Date,
}