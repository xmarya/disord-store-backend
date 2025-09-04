import PlatformReview from "@models/platformReviewModel";
import { createDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { PlatformReviewDataBody } from "@Types/Review";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewPlatformReview(user: UserDocument, reviewBody: string) {
  const { id, firstName, lastName, userType, image } = user;

  const data: PlatformReviewDataBody = { reviewBody, writer: id, firstName, lastName, userType, image };
  const safeCreateReview = safeThrowable(
    () => createDoc(PlatformReview, data),
    (error) => new Failure((error as Error).message)
  );
  const newReview = await extractSafeThrowableResult(() => safeCreateReview);

  return newReview;
}

export default createNewPlatformReview;
