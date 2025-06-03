import { confirmAuthorization } from "../../_services/store/storeService";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const hasAuthorization = catchAsync(async (request, response, next) => {
  console.log("hasAuthorization");
  const userId = request.user.id;
  // const storeId = request.params.storeId;  /* CHANGE LATER: the storeId doesn't exist in the request.params anymore, it's the modelId right now */
                /* for assistants*/       /* for storeOwner */
  const storeId = request.body.modelId || request.user.myStore; /* REQUIRES TESTING*/

  if (await confirmAuthorization(userId, storeId)) return next();
  return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
});

export default hasAuthorization