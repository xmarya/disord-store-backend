import { UserDocument } from "../User";
import { DomainEvent } from "./DomainEvent";

export interface UserCreatedEvent extends DomainEvent {
  type: "user.created";
  payload: {user:UserDocument, confirmUrl?:string};
  occurredAt: Date;
}

export interface UserUpdatedEvent extends DomainEvent {
  type: "user.updated";
  payload: {userId:string, user: UserDocument};
  occurredAt: Date;
}

export interface UserDeletedEvent extends DomainEvent {
  type: "user.deleted";
  payload: {userId:string};
  occurredAt: Date;
}
