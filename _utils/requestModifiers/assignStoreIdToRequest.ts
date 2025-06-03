import { getOneDocByFindOne } from "../../_services/global";
import StoreAssistant from "../../models/storeAssistantModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

export const assignStoreIdToRequest = catchAsync(async (request, response, next) => {

  let storeId;
  const user = request.user;

  if(user.userType === "storeOwner") storeId = user.myStore;

  else if(user.userType === "storeAssistant") {
    const assistant = await getOneDocByFindOne(StoreAssistant, {condition: {assistant: user.id}});
    if(!assistant) return next(new AppError(400, "couldn't find an assistant with this id"));
    storeId = assistant.inStore;
  }

  else return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));

  request.store = storeId;
  next();
});