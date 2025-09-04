import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument, UserTypes } from "../User";
import { DomainEvent } from "./DomainEvent";

export interface UserCreatedEvent extends DomainEvent {
  type: "user.created";
  payload: {user:UserDocument | AdminDocument, credentialsId:string, confirmUrl:string, randomToken:string};
  occurredAt: Date;
}

export interface EmailConfirmationSentEvent extends DomainEvent {
  type: "emailConfirmation.sent",
  payload: {userType:UserTypes, credentialsId:string, randomToken:string};
  occurredAt: Date;
}

export interface UserUpdatedEvent extends DomainEvent {
  type: "user.updated";
  payload: {user: UserDocument | AdminDocument};
  occurredAt: Date;
}

export interface UserDeletedEvent extends DomainEvent {
  type: "user.deleted";
  payload: {userId:string};
  occurredAt: Date;
}
