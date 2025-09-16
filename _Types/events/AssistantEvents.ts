import { MongoId } from "@Types/Schema/MongoId";
import { DomainEvent } from "./DomainEvent";
import { AssistantPermissions } from "@Types/Schema/Users/StoreAssistant";
import { NovuSubscriberData } from "@Types/externalAPIs/NovuSubscriberData";

export interface AssistantCreatedEvent extends DomainEvent {
  type: "assistant-created";
  payload: {
    outboxRecordId: string;
    storeId: MongoId;
    novuSubscriber: NovuSubscriberData;
    permissions: AssistantPermissions;
  };
  occurredAt: Date;
}

export interface AssistantUpdatedEvent extends DomainEvent {
  type: "assistant-updated";
  payload: {
    outboxRecordId: string;
    assistantId: MongoId;
    storeId: MongoId;
    novuSubscriber?: NovuSubscriberData;
    permissions?: AssistantPermissions;
  };
  occurredAt: Date;
}

export interface AssistantDeletedEvent extends DomainEvent {
  type: "assistant-deleted";
  payload: {
    outboxRecordId: string;
    assistantId: MongoId;
  };
  occurredAt: Date;
}
