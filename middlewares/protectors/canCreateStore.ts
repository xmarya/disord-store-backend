import getStoreOf from "@services/auth/storeServices/getStoreOfOwner";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const canCreateStore = catchAsync(async (request, response, next) => {
  const storeOwner = request.user as StoreOwnerDocument;
  if (!storeOwner.subscribedPlanDetails.paid) return next(returnError(new Forbidden("لابد من الأشتراك في باقة لإنشاء متجر جديد")));
  console.log("storeOwner.subscribedPlanDetails.paid", storeOwner.subscribedPlanDetails.paid);
  const result = await getStoreOf(request.user.id);

  if (result.ok) return next(returnError({ reason: "forbidden", message: "يوجد متجر لهذا المستخدم" }));
  if (!result.ok && result.reason === "error") return next(returnError(result));

  next();
});

export default canCreateStore;
