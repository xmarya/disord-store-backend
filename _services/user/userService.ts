import mongoose from "mongoose";
import User from "../../models/userModel";


export async function createNewUser(data:any) {
    const newUser = await User.create(data);
    return newUser;
}

export async function resetStoreOwnerToDefault(storeId:string | mongoose.Types.ObjectId, session:mongoose.ClientSession) {
    console.log("resetStoreOwnerToDefault");
    // await User.updateOne({_id: userId}, {
    //     userType:"user",
    //     $unset: {
    //         myStore: ""
    //     }
    // }).session(session);
    await User.updateOne({myStore: storeId}, {
        userType:"user",
        $unset: {
            myStore: ""
        }
    }).session(session);
}