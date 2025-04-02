import type {NextFunction} from "express";
import StoreAssistant from "../../models/storeAssistantModel";
import { StoreDocument } from "../../_Types/Store";
import Store from "../../models/storeModel";
import { startSession } from "mongoose";
import { AppError } from "../../_utils/AppError";
import User from "../../models/userModel";



export async function createStore(data:StoreDocument, next:NextFunction) {
    const {storeName, owner, logo, description} = data;
    const session = await startSession();
    session.startTransaction();

    try {
        const newStore = await Store.create({
            storeName,
            owner,
            description,
            logo
        }, {session});

        await User.findByIdAndUpdate(owner, {
            userType: "storeOwner",
            myStore: newStore[0].id
        }, {session});

        await session.commitTransaction();
        return newStore;
          
    } catch (error) {
        await session.abortTransaction();
        console.log((error as Error).message);
        next(new AppError(500, "حدث خطأ أثناء معالجة العملية. الرجاء المحاولة مجددًا"));
    } finally {
        await session.endSession();
    }
} 

export async function getAssistantPermissions(storeId:string, assistantId:string) {
    const assistant = await StoreAssistant.findOne({assistant: assistantId, inStore:storeId});

    return assistant;
}

export async function setStoreStatus(storeId:string, status: "active" | "suspended") {
    await Store.findByIdAndUpdate(storeId, { status });
}
