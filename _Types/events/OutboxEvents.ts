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


type ProductCreatedType = {
  type: "product-created";
  exchangeName: "product-events";
  queueName: "product-created-queue";
  routingKey: "product-created";
};

type ProductUpdatedType = {
  type: "product-updated";
  exchangeName: "product-events";
  queueName: "product-updated-queue";
  routingKey: "product-updated";
};

type ProductDeletedType = {
  type: "product-deleted";
  exchangeName: "product-events";
  queueName: "product-deleted-queue";
  routingKey: "product-deleted";
};

export type OutboxTypes = 
  | UserCreatedType 
  | UserUpdatedType 
  | UserDeletedType 
  | ProductCreatedType 
  | ProductUpdatedType 
  | ProductDeletedType;

export type OutboxEventTypesMap = OutboxTypes["type"];


