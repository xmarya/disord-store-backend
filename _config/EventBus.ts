import { filter, Subject } from "rxjs";
import { DomainEvent } from "@Types/events/DomainEvent";

class EventBus {
  private subject = new Subject<DomainEvent>();

  publish<T extends DomainEvent>(event: T) {
    this.subject.next(event);
  }

  ofType<T extends DomainEvent>(type: T["type"]) {
    return this.subject.asObservable().pipe(filter((event): event is T => event.type === type));
  }
}

const eventBus = new EventBus();

export default eventBus;
