import { MongoId } from "@Types/Schema/MongoId";
import { DomainEvent } from "./DomainEvent";
import { AssistantPermissions } from "@Types/Schema/Users/StoreAssistant";
import { NovuSubscriberData } from "@Types/externalAPIs/NovuSubscriberData";

export interface AssistantCreatedEvent extends DomainEvent {
  type: "assistant-created";
  payload: {
    storeId: MongoId;
    novuSubscriber: NovuSubscriberData;
    permissions: AssistantPermissions;
  };
  occurredAt: Date;
}

export interface AssistantUpdatedEvent extends DomainEvent {
  type: "assistant-updated";
  payload: {
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
    assistantId: MongoId;
  };
  occurredAt: Date;
}
