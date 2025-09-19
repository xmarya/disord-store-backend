import { ms } from "ms";
import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string, Record<string, boolean>>>;

export interface OutboxEvent extends DomainEvent {
  outboxRecordId: string;
}

export type PriorityLevelMap = {
  "no-priority": number,
  "background": number,
  "low":number,
  "normal": number,
  "hight":number,
  "urgent": number,
  "critical": number
};

export type PriorityLevel = keyof PriorityLevelMap;

const priority:PriorityLevelMap = {
  "no-priority": 0,
  "background": 1,
  "low":3,
  "normal": 5,
  "hight": 7,
  "urgent": 9,
  "critical": 10
}

export type QueueOptions = {
  durable?: boolean,
  maxPriority?:PriorityLevel,
  queueMode?: "default" | "lazy",
  messageTtl?:number, // in milliseconds
  maxLength?:number,
  deadLetterExchange?:string, // If a message expires or is rejected → RabbitMQ republishes it to dead-letter-exchange with routing key user-deleted-redis.DLQ.
  deadLetterRoutingKey?:string, // if not ser, RabbitMQ will reuse the original routing key.
  expires?:number // for temporary queues

}

export const QUEUE_OPTIONS = (options?:QueueOptions) => {
  const {durable = true, maxLength = 1000, messageTtl = ms("3m"), queueMode = "default", maxPriority, deadLetterExchange, deadLetterRoutingKey, expires} = options ?? {};
  return {
    durable, 
    maxPriority: maxPriority ? priority[maxPriority] : priority["no-priority"],
    arguments: {"x-queue-mode": queueMode},
    messageTtl,
    maxLength,
    ...(deadLetterExchange && {deadLetterExchange}),
    ...(deadLetterRoutingKey && {deadLetterRoutingKey}),
    ...(expires && {expires}),

  }
}

export type UserCreatedType = {
  type: "user-created";
  exchangeName: "user-events";
  queueName: `user-created-queue-${string}`;
  routingKey: "user-created";

  // deadExchangeName: "dead-user-events";
  // deadQueueName: `dead-user-created-queue-${string}`;
  // deadRoutingKey: "dead-user-created";

  // retryExchangeName?: "retry-user-events";
  // retryQueueName?: `retry-user-created-queue-${string}`;
  // retryRoutingKey?: "retry-user-created";
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

export type AssistantCreatedType = {
  type: "assistant-created";
  exchangeName: "assistant-events";
  queueName: `assistant-created-queue-${string}`;
  routingKey: "assistant-created";
};

export type AssistantUpdatedType = {
  type: "assistant-updated";
  exchangeName: "assistant-events";
  queueName: `assistant-updated-queue-${string}`;
  routingKey: "assistant-updated";
};

export type AssistantDeletedType = {
  type: "assistant-deleted";
  exchangeName: "assistant-events";
  queueName: `assistant-deleted-queue-${string}`;
  routingKey: "assistant-deleted";
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
  | ProductDeletedType
  | AssistantCreatedType
  | AssistantUpdatedType
  | AssistantDeletedType;

export type OutboxEventTypesMap = AllOutbox["type"];
export type OutboxEventQueueNamesMap<T extends AllOutbox> = T["queueName"];
