import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string, Record<string, boolean>>>;

export interface OutboxEvent extends DomainEvent {
  outboxRecordId: string;
}

export type UserCreatedType = {
  type: "user-created";
  exchangeName: "user-events";
  queueName: `user-created-queue-${string}`;
  routingKey: "user-created";
};

export type UserUpdatedType = {
  type: "user-updated";
  exchangeName: "user-events";
  queueName: `user-updated-queue-${string}`;
  routingKey: "user-updated";
};

export type UserDeletedType = {
  type: "user-deleted";
  exchangeName: "user-events";
  queueName: `user-deleted-queue-${string}`;
  routingKey: "user-deleted";
};


export type ProductCreatedType = {
  type: "product-created";
  exchangeName: "product-events";
  queueName: `product-created-queue-${string}`;
  routingKey: "product-created";
};

export type ProductUpdatedType = {
  type: "product-updated";
  exchangeName: "product-events";
  queueName: `product-updated-queue-${string}`;
  routingKey: "product-updated";
};

export type ProductDeletedType = {
  type: "product-deleted";
  exchangeName: "product-events";
  queueName: `product-deleted-queue-${string}`;
  routingKey: "product-deleted";
};

export type AllOutbox = 
  | UserCreatedType 
  | UserUpdatedType 
  | UserDeletedType 
  | ProductCreatedType 
  | ProductUpdatedType 
  | ProductDeletedType;

export type OutboxEventTypesMap = AllOutbox["type"];
export type OutboxEventQueueNamesMap<T extends AllOutbox> = T["queueName"];



