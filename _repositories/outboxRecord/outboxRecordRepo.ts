import { DomainEvent } from "@Types/events/DomainEvent";
import { OutboxRecordData } from "@Types/Schema/OutboxRecord";


async function createNewOutboxRecord<T extends DomainEvent>(recordData:OutboxRecordData<T>) {
    const {} = recordData;
}

async function getOneOutboxRecord() {

}

export default { createNewOutboxRecord, getOneOutboxRecord}