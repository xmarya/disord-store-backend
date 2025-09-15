import updateOutboxRecordToCompleted from "@services/_sharedServices/outboxRecordServices/updateOutboxRecordToCompleted";
import { DomainEvent } from "./DomainEvent";

export type OutboxRecordsInfo = Record<string, Record<string,  Record<string, boolean> >>;
export class OutboxRecordManager {
  // private outboxRecordsInfo: OutboxRecordsInfo = {} as any; // to git rid of Property 'outboxRecordsInfo' has no initializer and is not definitely assigned in the constructor
  constructor(private outboxRecordsInfo: OutboxRecordsInfo) {}

  registerHandler(handlerName: string, eventType: string, outboxRecordId: string) {
    this.outboxRecordsInfo[eventType][outboxRecordId][handlerName] = false;
  }

  getRecordACK(eventType: string, outboxRecordId: string): boolean {
    // return Object.values(this.outboxRecordsInfo[eventType][outboxRecordId]).every((consumer) => consumer.ack === true);
    return false;
  }

  async markAsFinished(name: string, handledEvent: string, outboxRecordId: string) {
    const allHandlersOfRecordId = this.outboxRecordsInfo[handledEvent][outboxRecordId] ?? [];

    // const index = allHandlersOfRecordId.findIndex((handler) => handler.name === name);
    // if (index === -1) return;

    // const finishedHandler = allHandlersOfRecordId[index];
    // finishedHandler.ack = true;

    // this.outboxRecordsInfo = {
    //   ...this.outboxRecordsInfo,
    //   [handledEvent]: {
    //     [outboxRecordId]: [...allHandlersOfRecordId, finishedHandler],
    //   },
    // };

    // TODO: update redis
  }

  async removeCompletedRecord(eventType: string, outboxRecordId: string) {}
}

export class HandlerRegister<T extends DomainEvent> {
  constructor(private manager: OutboxRecordManager, private handlerName: string, private eventType: T["type"], private outboxRecordId: string) {
    this.manager.registerHandler(this.handlerName, this.eventType, this.outboxRecordId);
  }

  finished() {
    console.log("whatisactuallysent?", this.handlerName, this.eventType, this.outboxRecordId);
    this.manager.markAsFinished(this.handlerName, this.eventType, this.outboxRecordId);
  }
}
export class RecordTracker<T extends DomainEvent> {
  constructor(private manager: OutboxRecordManager, private eventType: T["type"], private outboxRecordId: string) {}
  async canSetAsCompleted() {
    const recordACK = this.manager.getRecordACK(this.eventType, this.outboxRecordId);
    if (!recordACK) return;
    const result = await updateOutboxRecordToCompleted(this.outboxRecordId);
    if(!result.ok) return;
    // TODO: remove from redis
  }
}
