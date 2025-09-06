import getStoreOf from "@services/auth/storeServices/getStoreOf";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const canCreateStore = catchAsync(async (request, response, next) => {
  const result = await getStoreOf(request.user.id);

  if (result.ok) return next(returnError({ reason: "forbidden", message: "يوجد متجر لهذا المستخدم" }));
  if (!result.ok && result.reason === "error") return next(returnError(result));

  next();
});

export default canCreateStore;
