import novu from "../../../_config/novu";
import { AdminDocument } from "../../../_Types/admin/AdminUser";
import { MongoId } from "../../../_Types/MongoId";
import { AssistantPermissions } from "../../../_Types/StoreAssistant";
import { UserDocument } from "../../../_Types/User";


export async function novuCreateAssistantSubscriber(user: UserDocument, store:MongoId, permissions:AssistantPermissions) {
    const {id, firstName, lastName, userType, email, phoneNumber } = user;
    await novu.subscribers.create({
        subscriberId: id,
        firstName,
        lastName,
        email: "shhmanager1@gmail.com",
        phone: phoneNumber,
        data: {
            userType,
            store,
            permissions
        }
    });

}

export default novuCreateAssistantSubscriber;