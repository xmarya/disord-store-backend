import { DomainEvent } from "@Types/events/DomainEvent";
import OutboxRecordEvents from "@Types/events/OutboxEvents";


async function createNewOutboxRecord<T extends DomainEvent>(recordData:OutboxRecordEvents<T>) {
    const {} = recordData;
}

async function getOneOutboxRecord() {

}

export default { createNewOutboxRecord, getOneOutboxRecord}