import novu from "@config/novu";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuNewReview(reviewId:MongoId,subscribers:Array<string>, userFullName:string ) {

  const safeTrigger = safeThrowable(
    () =>
      novu.trigger({
        workflowId: "new-review",
        to: subscribers,
        payload: {
          userFullName,
          reviewId,
          reviewURL: "/to/reviewId",
        },
      }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeTrigger);

}

export default novuNewReview;
