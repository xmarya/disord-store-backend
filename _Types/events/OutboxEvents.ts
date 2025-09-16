import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string,  Record<string, boolean> >>;

export interface OutboxEvent extends DomainEvent{
  outboxRecordId:string
};

