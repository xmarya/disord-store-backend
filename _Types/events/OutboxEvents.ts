import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string, Record<string, boolean>>>;

export interface OutboxEvent extends DomainEvent {
  outboxRecordId: string;
}

type UserCreatedType = {
  type: "user-created";
  exchangeName: "user-events";
  queueName: "user-created-queue";
  routingKey: "user-created";
};

type UserUpdatedType = {
  type: "user-updated";
  exchangeName: "user-events";
  queueName: "user-updated-queue";
  routingKey: "user-updated";
};

type UserDeletedType = {
  type: "user-deleted";
  exchangeName: "user-events";
  queueName: "user-deleted-queue";
  routingKey: "user-deleted";
};

export type OutboxEventTypesMap = UserCreatedType["type"] | UserUpdatedType["type"] | UserDeletedType["type"];
