import StoreAssistant from "../../models/storeAssistantModel";
import { StoreDocument } from "../../_Types/Store";
import Store from "../../models/storeModel";
import {startSession, Types } from "mongoose";
import { AppError } from "../../_utils/AppError";
import User from "../../models/userModel";


export async function createStore(data:StoreDocument) {
    const {storeName, owner, logo, description} = data;
    const session = await startSession();
    session.startTransaction();

    try {
        const newStore = await Store.create([{
            storeName,
            owner,
            description,
            logo
        }], {session});

        await User.findByIdAndUpdate(owner, {
            userType: "storeOwner",
            myStore: newStore[0].id
        }, {session});

        await session.commitTransaction();
        return newStore;
          
    } catch (error) {
        await session.abortTransaction();
        console.log((error as Error).message);
        throw new AppError(500, "حدث خطأ أثناء معالجة العملية. الرجاء المحاولة مجددًا");
    } finally {
        await session.endSession();
    }
} 

export async function confirmAuthorization( userId:string, storeId:string):Promise<boolean> {
    console.log("confirmAuthorization", "user",userId, "store",storeId);
    //STEP 1) check if this userId is an owner Id or is in storeAssistants array

    const userIdExist = await Store.findOne({_id: storeId,
        $or: [
            {owner: userId},
            {storeAssistants: userId} // it's { storeAssistants: { $in: [userId] } } under the hood. since MongoDB automatically checks if userId is an element of the array
        ]
    });
    //STEP: return the value as boolean:
    return !!userIdExist; 
}

export async function setStoreStatus(storeId:string, status: "active" | "suspended") {
    await Store.findByIdAndUpdate(storeId, { status });
}
