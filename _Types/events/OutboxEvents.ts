import { DomainEvent } from "./DomainEvent";
import { Success } from "@Types/ResultTypes/Success";
import { Failure } from "@Types/ResultTypes/errors/Failure";

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
  // deadLetterExchange?: string; // If a message expires or is rejected → RabbitMQ republishes it to dead-letter-exchange with routing key user-deleted-redis.DLQ.
  // deadLetterRoutingKey?: string; // if not ser, RabbitMQ will reuse the original routing key.
  expires?: number; // for temporary queues
};

export type DeadLetterOptions<T extends AllOutbox> = {
  deadExchangeName: T["deadExchangeName"]; // If a message expires or is rejected → RabbitMQ republishes it to dead-letter-exchange with routing key user-deleted-redis.DLQ.
  deadRoutingKey: T["deadRoutingKey"]; // if not ser, RabbitMQ will reuse the original routing key.
  deadQueueName: T["deadQueueName"];
};

export type RetryLetterOptions<T extends AllOutbox> = {
  mainExchangeName: T["exchangeName"]; // redirect to the main exchange in bindQueue()
  mainRoutingKey: T["routingKey"]; // redirect to the main exchange using the main routing key in bindQueue()
  deadExchangeName: T["deadExchangeName"]; // in the deadLetterExchange option
  deadQueueName: T["deadQueueName"];
  deadRoutingKey: T["deadRoutingKey"]; // in the deadLetterRoutingKey
};

export type UserCreatedType = {
  type: "user-created";
  exchangeName: "main-user-events";
  queueName: `user-created-queue-${string}`;
  routingKey: "user-created";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-created-queue-${string}`;
  deadRoutingKey: "dead-user-created";
};

export type UserUpdatedType = {
  type: "user-updated";
  exchangeName: "main-user-events";
  queueName: `user-updated-queue-${string}`;
  routingKey: "user-updated";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-updated-queue-${string}`;
  deadRoutingKey: "dead-user-updated";
};

export type UserDeletedType = {
  type: "user-deleted";
  exchangeName: "main-user-events";
  queueName: `user-deleted-queue-${string}`;
  routingKey: "user-deleted";

  deadExchangeName: "dead-user-events";
  deadQueueName: `dead-user-deleted-queue-${string}`;
  deadRoutingKey: "dead-user-deleted";
};

export type StoreOwnerDeletedType = {
  type: "storeOwner-deleted";
  exchangeName: "main-storeOwner-events";
  queueName: `storeOwner-deleted-queue-${string}`;
  routingKey: "storeOwner-deleted";

  deadExchangeName: "dead-storeOwner-events";
  deadQueueName: `dead-storeOwner-deleted-queue-${string}`;
  deadRoutingKey: "dead-storeOwner-deleted";
};

export type AssistantCreatedType = {
  type: "assistant-created";
  exchangeName: "main-assistant-events";
  queueName: `assistant-created-queue-${string}`;
  routingKey: "assistant-created";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-created-queue-${string}`;
  deadRoutingKey: "dead-assistant-created";
};

export type AssistantUpdatedType = {
  type: "assistant-updated";
  exchangeName: "main-assistant-events";
  queueName: `assistant-updated-queue-${string}`;
  routingKey: "assistant-updated";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-updated-queue-${string}`;
  deadRoutingKey: "dead-assistant-updated";
};

export type AssistantDeletedType = {
  type: "assistant-deleted";
  exchangeName: "main-assistant-events";
  queueName: `assistant-deleted-queue-${string}`;
  routingKey: "assistant-deleted";

  deadExchangeName: "dead-assistant-events";
  deadQueueName: `dead-assistant-deleted-queue-${string}`;
  deadRoutingKey: "dead-assistant-deleted";
};

export type ProductDeletedType = {
  type: "product-deleted";
  exchangeName: "main-product-events";
  queueName: `product-deleted-queue-${string}`;
  routingKey: "product-deleted";

  deadExchangeName: "dead-product-events";
  deadQueueName: `dead-product-deleted-queue-${string}`;
  deadRoutingKey: "dead-product-deleted";
};

export type PlanSubscriptionUpdatedType = {
  type: "planSubscription-updated";
  exchangeName: "main-planSubscription-events";
  queueName: `planSubscription-updated-queue-${string}`;
  routingKey: "planSubscription-updated";

  deadExchangeName: "dead-planSubscription-events";
  deadQueueName: `dead-planSubscription-updated-queue-${string}`;
  deadRoutingKey: "dead-planSubscription-updated";
};

export type StoreCreatedType = {
  type: "store-created";
  exchangeName: "main-store-events";
  queueName: `store-created-queue-${string}`;
  routingKey: "store-created";

  deadExchangeName: "dead-store-events";
  deadQueueName: `dead-store-created-queue-${string}`;
  deadRoutingKey: "dead-store-created";
};

export type StoreDeletedType = {
  type: "store-deleted";
  exchangeName: "main-store-events";
  queueName: `store-deleted-queue-${string}`;
  routingKey: "store-deleted";

  deadExchangeName: "dead-store-events";
  deadQueueName: `dead-store-deleted-queue-${string}`;
  deadRoutingKey: "dead-store-deleted";
};

export type StoreSuspendedType = {
  type: "store-suspended";
  exchangeName: "main-store-events";
  queueName: `store-suspended-queue-${string}`;
  routingKey: "store-suspended";

  deadExchangeName: "dead-store-events";
  deadQueueName: `dead-store-suspended-queue-${string}`;
  deadRoutingKey: "dead-store-suspended";
};

export type ReviewCreatedType = {
  type: "review-created";
  exchangeName: "main-review-events";
  queueName: `review-created-queue-${string}`;
  routingKey: "review-created";

  deadExchangeName: "dead-review-events";
  deadQueueName: `dead-review-created-queue-${string}`;
  deadRoutingKey: "dead-review-created";
};

export type StoreRepliedToReviewType = {
  type: "store-replied-to-review";
  exchangeName: "main-review-events";
  queueName: `store-replied-to-review-queue-${string}`;
  routingKey: "store-replied-to-review";

  deadExchangeName: "dead-review-events";
  deadQueueName: `dead-store-replied-to-review-queue-${string}`;
  deadRoutingKey: "dead-store-replied-to-review";
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
  | StoreOwnerDeletedType
  | StoreCreatedType
  | StoreDeletedType
  | StoreSuspendedType
  | ReviewCreatedType
  | StoreRepliedToReviewType;

export type OutboxEventTypesMap = AllOutbox["type"];
export type OutboxEventQueueNamesMap<T extends AllOutbox> = T["queueName"];

export type ConsumerRegister<T extends AllOutbox, P extends OutboxEvent> = {
  receiver: (event: P) => Promise<Success<{ serviceName: string; ack: boolean }> | Failure>;
  queueName: OutboxEventQueueNamesMap<T>;
  queueOptions?: QueueOptions;
  retryLetterOptions?: RetryLetterOptions<T>;
  // deadLetterOptions?: DeadLetterOptions<T>;
};
