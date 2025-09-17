import { MongoId } from "@Types/Schema/MongoId";
import { AssistantPermissions } from "@Types/Schema/Users/StoreAssistant";
import { NovuSubscriberData } from "@Types/externalAPIs/NovuSubscriberData";
import { OutboxEvent } from "./OutboxEvents";

export interface AssistantCreatedEvent extends OutboxEvent {
  type: "assistant-created";
  outboxRecordId: string;
  payload: {
    storeId: MongoId;
    novuSubscriber: NovuSubscriberData;
    permissions: AssistantPermissions;
  };
  occurredAt: Date;
}

export interface AssistantUpdatedEvent extends OutboxEvent {
  type: "assistant-updated";
  outboxRecordId: string;
  payload: {
    assistantId: MongoId;
    storeId: MongoId;
    novuSubscriber?: NovuSubscriberData;
    permissions?: AssistantPermissions;
  };
  occurredAt: Date;
}

export interface AssistantDeletedEvent extends OutboxEvent {
  type: "assistant-deleted";
  outboxRecordId: string;
  payload: {
    storeId:MongoId
    assistantsId: Array<MongoId>;
  };
  occurredAt: Date;
}
