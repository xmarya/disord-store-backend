import { AdminDocument } from "@Types/Schema/Users/admin/AdminUser";
import { UserDocument, UserTypes } from "../Schema/Users/RegularUser";
import { DomainEvent } from "./DomainEvent";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";

export interface UserCreatedEvent extends DomainEvent {
  type: "user.created";
  payload: { user: UserDocument | AdminDocument; credentialsId: string; confirmUrl: string; randomToken: string };
  occurredAt: Date;
}

export interface EmailConfirmationSentEvent extends DomainEvent {
  type: "emailConfirmation.sent";
  payload: { userType: UserTypes; credentialsId: string; randomToken: string };
  occurredAt: Date;
}

export interface UserUpdatedEvent extends DomainEvent {
  type: "user.updated";
  payload: {
    user: UserDocument | AdminDocument | StoreAssistantDocument;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}

export interface UserDeletedEvent extends DomainEvent {
  type: "user.deleted";
  payload: { userId: string };
  occurredAt: Date;
}

export interface UserLoggedInEvent extends DomainEvent {
  type: "user.loggedIn";
  payload: {
    user: UserDocument | AdminDocument | StoreAssistantDocument;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
export interface UserCredentialsUpdatedEvent extends DomainEvent {
  type: "userCredentials.updated";
  payload: {
    user: UserDocument | AdminDocument | StoreAssistantDocument;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
