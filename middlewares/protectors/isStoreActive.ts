import { getOneDocById } from "../../_services/global";
import Store from "../../models/storeModel";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";

const isStoreActive = catchAsync(async (request, response, next) => {
  const { storeId } = request.params;

  const store = await getOneDocById(Store, storeId, { select: ["status"] });
  if (store?.status !== "active") return next(new AppError(403, "لا يمكن الوصول لهذا المتجر في الوقت الحالي"));

  next();
});

export default isStoreActive;
