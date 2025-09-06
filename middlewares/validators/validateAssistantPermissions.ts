import { type Request, type Response, type NextFunction, request } from "express";
import { AssistantPermissions } from "@Types/Schema/Users/StoreAssistant";
import { getAssistantPermissions } from "@repositories/assistant/assistantRepo";
import { AppError } from "@Types/ResultTypes/errors/AppError";

const checkAssistantPermissions = (permissionKey: keyof AssistantPermissions) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (request.user.userType === "storeOwner") return next();

    const storeId = request.store;
    const assistantId = request.user.id;

    if (!storeId || !assistantId) return next(new AppError(400, "معلومات المتجر أو المستخدم مفقودة"));

    const assistant = await getAssistantPermissions(assistantId, storeId);
    if (!assistant) return next(new AppError(403, "هذا المستخدم غير موجود من ضمن المساعدين"));

    if (!assistant.permissions[permissionKey]) return next(new AppError(403, "غير مصرح لك الوصول"));

    next();
  };
};

export default checkAssistantPermissions;
