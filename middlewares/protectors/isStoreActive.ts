import { getOneDocById } from "@repositories/global";
import Store from "@models/storeModel";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const isStoreActive = catchAsync(async (request, response, next) => {
  const { storeId } = request.params;

  const store = await getOneDocById(Store, storeId, { select: ["status"] });
  if(!store?.id) return next(returnError({reason: "not-found", message:"لا يوجد متجر بهذا المعرف"}))
  if (store?.status !== "active") return next(new AppError(403, "لا يمكن الوصول لهذا المتجر في الوقت الحالي"));

  next();
});

export default isStoreActive;
