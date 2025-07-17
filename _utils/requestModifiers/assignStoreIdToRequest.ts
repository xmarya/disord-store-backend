import { getOneDocByFindOne } from "../../_services/global";
import StoreAssistant from "../../models/storeAssistantModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

export const assignStoreIdToRequest = catchAsync(async (request, response, next) => {
  // console.log("assignStoreIdToRequest");
  if (request.user.userType !== "storeOwner" && request.user.userType !== "storeAssistant") return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  // if the store is exist from the previous cache middleware
  if (request.store) return next();

  console.log("STORE ID ISN'T FROM THE CACHE");
  const user = request.user;
  let storeId;

  if (user.userType === "storeOwner") storeId = user.myStore;
  else {
    const assistant = await getOneDocByFindOne(StoreAssistant, { condition: { assistant: user.id } });
    if (!assistant) return next(new AppError(400, "لم يتم العثور على متجر مرتبط بهذا المستخدم"));
    storeId = assistant.inStore;
  }

  request.store = storeId;
  next();
});
