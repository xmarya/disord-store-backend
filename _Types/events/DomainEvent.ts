
export interface DomainEvent {
    type:string,
    payload:unknown & { outboxRecordId: string },
    occurredAt:Date
}