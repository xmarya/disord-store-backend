import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const assignStoreIdToRequest = catchAsync(async (request, response, next) => {
  console.log("assignStoreIdToRequest");

  // if the store is exist from the previous cache middleware
  if (request.store) return next();

  const user = request.user;
  let storeId;

  if (user.userType === "storeOwner") storeId = user.myStore;
  else if (user.userType === "storeAssistant") storeId = user.inStore; /*REQUIRES TESTING*/
  // else {
  //   const assistant = await getOneDocByFindOne(StoreAssistant, { condition: { assistant: user.id } });
  //   if (!assistant) return next(new AppError(400, "لم يتم العثور على متجر مرتبط بهذا المستخدم"));
  //   storeId = assistant.inStore;
  // }
  else return next(returnError(new Forbidden()))

  request.store = storeId;
  console.log("whatisthen??", request.store);
  console.log(request.store);
  next();
});
