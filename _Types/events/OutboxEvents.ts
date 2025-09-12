import { DomainEvent } from "./DomainEvent";

export default interface OutboxEvent extends DomainEvent {
  //   aggregateId: MongoId;
  sent: Date | null;
  status: "pending" | "processing" | "completed";
  for?: string;
}


interface InternalsOutboxEvent extends OutboxEvent {}

interface ExternalsOutboxEvent extends OutboxEvent {}
