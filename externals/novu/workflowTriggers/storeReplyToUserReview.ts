import novu from "@config/novu";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuStoreReplyToUserReview({ reviewId, storeName, userId, email }: { reviewId: string; storeName: string; userId: string; email: string }) {
  const replyURL = `/review/url/${reviewId}`;
  const workflowId = "store-reply-to-user-review";
  const subscriberData = { subscriberId: userId, email };
  const payload = { storeName, replyURL };

  const triggerResult = safeThrowable(
    () =>
      novu.trigger({
        workflowId,
        to: subscriberData,
        payload,
      }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(()=> triggerResult);
}

export default novuStoreReplyToUserReview;
