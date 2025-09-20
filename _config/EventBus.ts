import { DomainEvent } from "@Types/events/DomainEvent";
import { filter, Subject } from "rxjs";


class EventBus {
  private subject = new Subject<DomainEvent>();

  publish<T extends DomainEvent>(event: T) {
    this.subject.next(event);
  }

  ofType<T extends DomainEvent>(type: T["type"]) {
    return this.subject.asObservable().pipe(filter((event): event is T => event.type === type));
  }

  ofMultipleTypes<T extends readonly DomainEvent[]>(types:Array<T[number]["type"]>) {
    return this.subject.asObservable().pipe(filter( (event): event is T[number] => types.includes(event.type) ));
  }
}

const eventBus = new EventBus();

export default eventBus;
