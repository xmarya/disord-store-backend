import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "../User";
import { DomainEvent } from "./DomainEvent";

export interface UserCreatedEvent extends DomainEvent {
  type: "user.created";
  payload: {user:UserDocument | AdminDocument, confirmUrl?:string};
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
