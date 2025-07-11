import { getOneDocByFindOne } from "../../_services/global";
import StoreAssistant from "../../models/storeAssistantModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

export const assignStoreIdToRequest = catchAsync(async (request, response, next) => {
  // console.log("assignStoreIdToRequest");
  if (request.user.userType !== "storeOwner" && request.user.userType !== "storeAssistant") return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  let storeId;
  const user = request.user;

  if (user.userType === "storeOwner") storeId = user.myStore;

  else{
    const assistant = await getOneDocByFindOne(StoreAssistant, { condition: { assistant: user.id } });
    if (!assistant) return next(new AppError(400, "couldn't find an assistant with this id"));
    storeId = assistant.inStore;
  }

  request.store = storeId;
  next();
});
