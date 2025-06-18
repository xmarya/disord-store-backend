import mongoose, { startSession } from "mongoose";
import { MongoId } from "../../_Types/MongoId";
import { StoreDataBody } from "../../_Types/Store";
import { AppError } from "../../_utils/AppError";
import Store from "../../models/storeModel";
import User from "../../models/userModel";
import Product from "../../models/productNewModel";


export async function createStore(data:StoreDataBody) {
    const {storeName, description, owner, inPlan, logo,} = data;
    const session = await startSession();
    session.startTransaction();

    try {
        const newStore = await Store.create([{
           storeName,
           description,
           logo,
           owner,
           inPlan
        }], {session});

        await User.findByIdAndUpdate(owner, {
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

export async function getStoreWithProducts(storeId: MongoId) {
    const store = await Store.findById(storeId);
    const products = await Product.find({store:storeId});

    return {store, products};
}

export async function confirmAuthorization( userId:string, storeId:MongoId):Promise<boolean> {
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

export async function deleteStore(storeId:MongoId, session:mongoose.ClientSession){
    const deletedStore = await Store.findByIdAndDelete(storeId, {session});

    return deletedStore;
}