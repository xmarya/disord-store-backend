import { updateInPlanForAssistants } from "@repositories/assistant/assistantRepo";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function updateAssistantInPlanConsumer(event:PlanSubscriptionUpdatedEvent) {
    const {planId, storeOwner: {myStore}} = event.payload;

    if(!myStore) return new Success({serviceName: "assistants-collection", ack: true});
    const safeUpdateAssistants = safeThrowable(
        () => updateInPlanForAssistants(myStore, planId),
        (error) => new Failure((error as Error).message)
    );

    const updateAssistantsResult = await extractSafeThrowableResult(() => safeUpdateAssistants);
    if(!updateAssistantsResult.ok) return new Failure(updateAssistantsResult.message, {serviceName: "assistants-collection", ack: false});

    return new Success({serviceName: "assistants-collection", ack: true});
}

export default updateAssistantInPlanConsumer;