import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";


async function deleteAllStoreAssistants(storeId:MongoId, session:mongoose.ClientSession) {

    const safeDeleteAllAssistants = safeThrowable(
        () => deleteAllAssistants(storeId, session),
        (error) => new Failure((error as Error).message)
    );

    return extractSafeThrowableResult(() => safeDeleteAllAssistants);

}

export default deleteAllStoreAssistants