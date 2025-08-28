import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getUserCredentials(adminId:string) {
    const safeGetUser = safeThrowable(
            () => getOneDocById(User, adminId, { select: ["credentials"] }),
            () => new Error(INTERNAL_ERROR_MESSAGE)
        );

    return await extractSafeThrowableResult(() => safeGetUser);
}

export default getUserCredentials;