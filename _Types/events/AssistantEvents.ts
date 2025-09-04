import { MongoId } from "@Types/MongoId";
import { DomainEvent } from "./DomainEvent";
import { NovuSubscriberData } from "@Types/NovuSubscriberData";
import { AssistantPermissions } from "@Types/StoreAssistant";


export interface AssistantCreatedEvent extends DomainEvent {
    type: "assistant.created", 
    payload: {
        storeId:MongoId,
        novuSubscriber:NovuSubscriberData,
        permissions:AssistantPermissions
    }
    occurredAt: Date
}

export interface AssistantUpdatedEvent extends DomainEvent {
    type: "assistant.updated", 
    payload: {
        assistantId:MongoId,
        storeId:MongoId,
        novuSubscriber?:NovuSubscriberData,
        permissions?:AssistantPermissions
    }
    occurredAt: Date
}

export interface AssistantDeletedEvent extends DomainEvent {
    type: "assistant.deleted", 
    payload: {
        assistantId:MongoId,
    }
    occurredAt: Date
}