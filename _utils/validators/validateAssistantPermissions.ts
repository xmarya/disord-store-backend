/*
    - Verifying data checks if the data is accurate and matches the source.
    Validating data checks if the data meets the required format and rules.

    - Verification ensures correctness; validation ensures compliance.

    - Verification is about "is it true?"; validation is about "is it acceptable?"

    - Verification can involve external checks; validation uses predefined rules.
*/

import { type Request, type Response, type NextFunction, request } from "express";
import { AssistantPermissions } from "../../_Types/StoreAssistant";
import { getAssistantPermissions } from "../../_services/assistant/assistantService";
import { AppError } from "../AppError";


const checkAssistantPermissions = (permissionKey: keyof AssistantPermissions) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (request.user.userType === "storeOwner") return next();
    // console.log("checkAssistantPermissions", request.user.userType, permissionKey);

    const storeId = request.store; /* REQUIRES TESTING*/
    const assistantId = request.user.id;
    

    // console.log("request.body.modelId", storeId, "request.user.id", assistantId);

    if (!storeId || !assistantId) return next(new AppError(400, "معلومات المتجر أو المستخدم مفقودة"));

    const assistant = await getAssistantPermissions(storeId, assistantId);
    if (!assistant) return next(new AppError(403, "هذا المستخدم غير موجود من ضمن المساعدين"));

    if (!assistant.permissions[permissionKey]) return next(new AppError(403, "غير مصرح لك الوصول"));

    next();
  };
};

export default checkAssistantPermissions