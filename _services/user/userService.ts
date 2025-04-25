import mongoose from "mongoose";
import User from "../../models/userModel";

export async function resetStoreOwnerToDefault(userId:string | mongoose.Types.ObjectId, session:mongoose.ClientSession) {
    console.log("resetStoreOwnerToDefault");
    await User.updateOne({_id: userId}, {
        userType:"user",
        $unset: {
            myStore: ""
        }
    }).session(session);
}