import { getOneDocByFindOne } from "../../_services/global";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import StoreAssistant from "../../models/storeAssistantModel";


export const assignStoreIdToRequest = catchAsync(async (request, response, next) => {
  // console.log("assignStoreIdToRequest");
  
  // if the store is exist from the previous cache middleware
  if (request.store) return next();

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
