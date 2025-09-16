import { AllUsers } from "@Types/Schema/Users/AllUser";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { DomainEvent } from "./DomainEvent";
import { OutboxEvent } from "./OutboxEvents";

export interface UserCreatedEvent extends OutboxEvent {
  outboxRecordId: string;
  type: "user-created";
  payload: { user: AllUsers; credentialsId: string; confirmUrl: string; randomToken: string };
  occurredAt: Date;
}

export interface EmailConfirmationSentEvent extends DomainEvent {
  type: "emailConfirmation-sent";
  payload: { userType: UserTypes; credentialsId: string; randomToken: string };
  occurredAt: Date;
}

export interface UserUpdatedEvent extends OutboxEvent {
  outboxRecordId: string;
  type: "user-updated";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}

export interface UserDeletedEvent extends OutboxEvent {
  outboxRecordId: string;
  type: "user-deleted";

  payload: { usersId: Array<string>; userType:UserTypes, emailsToDelete: Array<string> };
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
export interface UserCredentialsUpdatedEvent extends OutboxEvent {
  outboxRecordId: string;
  type: "userCredentials-updated";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
