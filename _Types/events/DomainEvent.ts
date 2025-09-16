
export interface DomainEvent {
    type:string,
    payload:unknown,
    occurredAt:Date
}