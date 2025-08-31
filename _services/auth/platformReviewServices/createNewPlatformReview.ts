import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import PlatformReview from "@models/platformReviewModel";
import { createDoc } from "@repositories/global";
import { PlatformReviewDataBody } from "@Types/Review";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewPlatformReview(user: UserDocument, reviewBody: string) {
  const { id, firstName, lastName, userType, image } = user;

  const data: PlatformReviewDataBody = { reviewBody, writer: id, firstName, lastName, userType, image };
  const safeCreateReview = safeThrowable(
    () => createDoc(PlatformReview, data),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );
  const newReview = await extractSafeThrowableResult(() => safeCreateReview);

  return newReview;
}

export default createNewPlatformReview;
