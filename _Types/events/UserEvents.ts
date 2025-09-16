import { AllUsers } from "@Types/Schema/Users/AllUser";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { DomainEvent } from "./DomainEvent";

export interface UserCreatedEvent extends DomainEvent {
  type: "user-created";
  payload: { outboxRecordId: string; user: AllUsers; credentialsId: string; confirmUrl: string; randomToken: string };
  occurredAt: Date;
}

export interface EmailConfirmationSentEvent extends Omit<DomainEvent, "payload"> {
  type: "emailConfirmation-sent";
  payload: { userType: UserTypes; credentialsId: string; randomToken: string };
  occurredAt: Date;
}

export interface UserUpdatedEvent extends DomainEvent {
  type: "user-updated";
  payload: {
    outboxRecordId: string;
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}

export interface UserDeletedEvent extends DomainEvent {
  type: "user-deleted";
  payload: { outboxRecordId: string; usersId: Array<string>; emailsToDelete: Array<string> };
  occurredAt: Date;
}

export interface UserLoggedInEvent extends Omit<DomainEvent, "payload"> {
  type: "user-loggedIn";
  payload: {
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
export interface UserCredentialsUpdatedEvent extends DomainEvent {
  type: "userCredentials-updated";
  payload: {
    outboxRecordId: string;
    user: AllUsers;
    emailConfirmed?: boolean;
  };
  occurredAt: Date;
}
