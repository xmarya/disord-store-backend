import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string,  Record<string, boolean> >>;

export default interface OutboxEvent extends DomainEvent {
  //   aggregateId: MongoId;
  sent: Date | null;
  status: "pending" | "completed";
  for?: string;
}


interface InternalsOutboxEvent extends OutboxEvent {}

interface ExternalsOutboxEvent extends OutboxEvent {}
