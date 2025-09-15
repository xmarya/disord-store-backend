import { AllUsers } from "@Types/Schema/Users/AllUser";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { DomainEvent } from "./DomainEvent";

export interface UserCreatedEvent extends DomainEvent {
  outboxRecordId?: string;
  type: "user-created";
  payload: { user: AllUsers; credentialsId: string; confirmUrl: string; randomToken: string };
  occurredAt: Date;
}

export interface EmailConfirmationSentEvent extends DomainEvent {
  outboxRecordId?: string;
  type: "emailConfirmation-sent";
  payload: { userType: UserTypes; credentialsId: string; randomToken: string };
  occurredAt: Date;
}

export interface UserUpdatedEvent extends DomainEvent {
  outboxRecordId?: string;
  type: "user-updated";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}

export interface UserDeletedEvent extends DomainEvent {
  outboxRecordId?: string;
  type: "user-deleted";
  payload: { usersId: Array<string>; emailsToDelete: Array<string> };
  occurredAt: Date;
}

export interface UserLoggedInEvent extends DomainEvent {
  type: "user-loggedIn";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
export interface UserCredentialsUpdatedEvent extends DomainEvent {
  outboxRecordId?: string;
  type: "userCredentials-updated";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
