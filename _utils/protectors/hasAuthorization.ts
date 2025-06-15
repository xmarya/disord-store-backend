import { confirmAuthorization } from "../../_services/store/storeService";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const hasAuthorization = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const storeId = request.store

  if (await confirmAuthorization(userId, storeId)) return next();
  return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
});

export default hasAuthorization