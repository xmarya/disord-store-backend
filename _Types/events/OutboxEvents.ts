import { DomainEvent } from "./DomainEvent";
import { Success } from "@Types/ResultTypes/Success";
import { Failure, RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";

export type OutboxRecordsInfo = Record<string, Record<string, boolean>>;

export interface OutboxEvent extends DomainEvent {
  outboxRecordId: string;
}

export type PriorityLevelMap = {
  "no-priority": number;
  background: number;
  low: number;
  normal: number;
  hight: number;
  urgent: number;
  critical: number;
};

export type PriorityLevel = keyof PriorityLevelMap;

export type QueueOptions = {
  durable?: boolean;
  maxPriority?: PriorityLevel;
  queueMode?: "default" | "lazy";
  messageTtl?: number; // in milliseconds
  maxLength?: number;
  deadLetterExchange?: string; // If a message expires or is rejected → RabbitMQ republishes it to dead-letter-exchange with routing key user-deleted-redis.DLQ.
  deadLetterRoutingKey?: string; // if not ser, RabbitMQ will reuse the original routing key.
  expires?: number; // for temporary queues
};

export type DeadLetterOptions<T extends AllOutbox> = {
  deadExchangeName: T["deadExchangeName"]; // If a message expires or is rejected → RabbitMQ republishes it to dead-letter-exchange with routing key user-deleted-redis.DLQ.
  deadRoutingKey: T["deadRoutingKey"]; // if not ser, RabbitMQ will reuse the original routing key.
  deadQueueName: T["deadQueueName"];
};

/*
export type RetryLetterOptions<T extends AllOutbox> = {
  mainExchangeName: T["exchangeName"]; // redirect to the main exchange in deadExchange's queue option
  mainRoutingKey: T["routingKey"]; // redirect to the main exchange using the main routing key
  deadExchangeName: T["deadExchangeName"];
  retryQueueName: T["retryQueueName"];
  retryRoutingKey: T["retryRoutingKey"];
};
*/
export type UserCreatedType = {
  type: "user-created";
  exchangeName: "main-user-events";
  queueName: `user-created-queue-${string}`;
  routingKey: "user-created";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-created-queue-${string}`;
  deadRoutingKey: "dead-user-created";

  // retryExchangeName: "retry-user-events";
  // retryQueueName: `retry-user-created-queue-${string}`;
  // retryRoutingKey: "retry-user-created";
};

export type UserUpdatedType = {
  type: "user-updated";
  exchangeName: "main-user-events";
  queueName: `user-updated-queue-${string}`;
  routingKey: "user-updated";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-updated-queue-${string}`;
  deadRoutingKey: "dead-user-updated";

  // retryExchangeName: "retry-user-events";
  // retryQueueName: `retry-user-updated-queue-${string}`;
  // retryRoutingKey: "retry-user-updated";
};

export type UserDeletedType = {
  type: "user-deleted";
  exchangeName: "main-user-events";
  queueName: `user-deleted-queue-${string}`;
  routingKey: "user-deleted";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-deleted-queue-${string}`;
  deadRoutingKey: "dead-user-deleted";

  // retryExchangeName: "retry-user-events";
  // retryQueueName: `retry-user-deleted-queue-${string}`;
  // retryRoutingKey: "retry-user-deleted";
};

export type AssistantCreatedType = {
  type: "assistant-created";
  exchangeName: "main-assistant-events";
  queueName: `assistant-created-queue-${string}`;
  routingKey: "assistant-created";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-created-queue-${string}`;
  deadRoutingKey: "dead-assistant-created";

  // retryExchangeName: "retry-assistant-events";
  // retryQueueName: `retry-assistant-created-queue-${string}`;
  // retryRoutingKey: "retry-assistant-created";
};

export type AssistantUpdatedType = {
  type: "assistant-updated";
  exchangeName: "main-assistant-events";
  queueName: `assistant-updated-queue-${string}`;
  routingKey: "assistant-updated";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-updated-queue-${string}`;
  deadRoutingKey: "dead-assistant-updated";

  // retryExchangeName: "retry-assistant-events";
  // retryQueueName: `retry-assistant-updated-queue-${string}`;
  // retryRoutingKey: "retry-assistant-updated";
};

export type AssistantDeletedType = {
  type: "assistant-deleted";
  exchangeName: "main-assistant-events";
  queueName: `assistant-deleted-queue-${string}`;
  routingKey: "assistant-deleted";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-deleted-queue-${string}`;
  deadRoutingKey: "dead-assistant-deleted";

  // retryExchangeName: "retry-assistant-events";
  // retryQueueName: `retry-assistant-deleted-queue-${string}`;
  // retryRoutingKey: "retry-assistant-deleted";
};

export type ProductDeletedType = {
  type: "product-deleted";
  exchangeName: "main-product-events";
  queueName: `product-deleted-queue-${string}`;
  routingKey: "product-deleted";

  deadExchangeName: "dead-product-events";
  deadQueueName: `dead-product-deleted-queue-${string}`;
  deadRoutingKey: "dead-product-deleted";

  // retryExchangeName: "retry-product-events";
  // retryQueueName: `retry-product-created-queue-${string}`;
  // retryRoutingKey: "retry-product-created";
};

export type PlanSubscriptionUpdatedType = {
  type: "planSubscription-updated";
  exchangeName: "main-planSubscription-events";
  queueName: `planSubscription-updated-queue-${string}`;
  routingKey: "planSubscription-updated";

  deadExchangeName: "dead-planSubscription-events";
  deadQueueName: `dead-planSubscription-updated-queue-${string}`;
  deadRoutingKey: "dead-planSubscription-updated";

  // retryExchangeName: "retry-planSubscription-events";
  // retryQueueName: `retry-planSubscription-updated-queue-${string}`;
  // retryRoutingKey: "retry-planSubscription-updated";
};

export type StoreDeletedType = {
  type: "store-deleted";
  exchangeName: "main-store-events";
  queueName: `store-deleted-queue-${string}`;
  routingKey: "store-deleted";

  deadExchangeName: "dead-store-events";
  deadQueueName: `dead-store-deleted-queue-${string}`;
  deadRoutingKey: "dead-store-deleted";

  // retryExchangeName: "retry-store-events";
  // retryQueueName: `retry-store-deleted-queue-${string}`;
  // retryRoutingKey: "retry-store-deleted";
};

export type AllOutbox =
  | UserCreatedType
  | UserUpdatedType
  | UserDeletedType
  | ProductDeletedType
  | AssistantCreatedType
  | AssistantUpdatedType
  | AssistantDeletedType
  | PlanSubscriptionUpdatedType
  | StoreDeletedType;

export type OutboxEventTypesMap = AllOutbox["type"];
export type OutboxEventQueueNamesMap<T extends AllOutbox> = T["queueName"];

export type ConsumerRegister<T extends AllOutbox, P extends OutboxEvent> = {
  receiver: (event: P) => Promise<Success<{ serviceName: string; ack: boolean }> | Failure>;
  queueName: OutboxEventQueueNamesMap<T>;
  requeue?: boolean;
  queueOptions?: QueueOptions;
  deadLetterOptions?: DeadLetterOptions<T>;
};
