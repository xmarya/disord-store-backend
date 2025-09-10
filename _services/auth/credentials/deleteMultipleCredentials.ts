import { deleteBulkCredentials } from "@repositories/credentials/credentialsRepo";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import { AnyBulkWriteOperation, startSession } from "mongoose";


async function deleteMultipleCredentials(emails:Array<string>){

    const session = await startSession();
    const bulkOps:Array<AnyBulkWriteOperation<CredentialsDocument>> = [{
        deleteMany:{
            filter: {email: {$in: emails}}
        }
    }];
    const result = await session.withTransaction(async() => {
        const bulkResult = await deleteBulkCredentials(bulkOps, session);
        const hasError = await Promise.resolve(bulkResult.hasWriteErrors());
        const errorList = await Promise.resolve(bulkResult.getWriteErrors());
        //TODO if(bulkResult.deletedCount)  // mark outbox record as completed
        return {hasError, errorList}
    
    });

    console.log("result", result);
    
}

export default deleteMultipleCredentials;