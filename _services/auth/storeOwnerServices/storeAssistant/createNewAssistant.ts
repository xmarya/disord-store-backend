import { createAssistant } from "@repositories/assistant/assistantRepo"
import { Failure } from "@Types/ResultTypes/errors/Failure"
import { StoreAssistant } from "@Types/Schema/Users/StoreAssistant"
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult"
import safeThrowable from "@utils/safeThrowable"
import mongoose from "mongoose"


async function createNewAssistant(newAssistantData:StoreAssistant,session:mongoose.ClientSession) {
    const safeCreateAssistant = safeThrowable(
        () => createAssistant(newAssistantData, session),
        (error) => new Failure((error as Error).message)
    );



    return await extractSafeThrowableResult(() => safeCreateAssistant);
}

export default createNewAssistant