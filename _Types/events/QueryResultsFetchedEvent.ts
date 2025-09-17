import { DomainEvent } from "./DomainEvent";

export interface QueryResultsFetchedEvent extends Omit<DomainEvent,"outboxRecordId"> {
  type: "queryResults-fetched";
  payload: { key: string; queryResults: unknown[] };
}
