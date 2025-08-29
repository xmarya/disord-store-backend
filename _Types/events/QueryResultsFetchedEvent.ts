import { DomainEvent } from "./DomainEvent";

export interface QueryResultsFetchedEvent extends DomainEvent {
  type: "queryResults-fetched";
  payload: { key: string; queryResults: unknown[] };
  occurredAt: Date;
}
