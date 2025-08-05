import novu from "../../../_config/novu";
import { AdminDocument } from "../../../_Types/admin/AdminUser";
import { UserDocument } from "../../../_Types/User";


async function createNovuSubscriber(user: UserDocument | AdminDocument) {
    const {id, firstName, lastName, image, userType, email, phoneNumber } = user;
    const subscriber = await novu.subscribers.create({
        subscriberId: id,
        firstName,
        lastName,
        avatar: image,
        email,
        phone: phoneNumber,
        data: {
            userType,
            ...(userType === "storeOwner" && {store: user.myStore})
        }
    });

    console.log("whatnovesubscriber", subscriber);

}

export default createNovuSubscriber;