import User from "@models/userModel";
import { isExist } from "@repositories/global";
import { MongoId } from "@Types/MongoId";



async function getUserEmail(userId:MongoId, email:string):Promise<boolean> {
    return await isExist(User, { email, id: { $ne: userId } });
}

export default getUserEmail;