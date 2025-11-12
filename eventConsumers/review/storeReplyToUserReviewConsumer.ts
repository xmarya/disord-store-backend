import novuStoreReplyToUserReview from "@externals/novu/workflowTriggers/storeReplyToUserReview";
import { getOneDocById } from "@repositories/global";
import getUserProfile from "@services/auth/usersServices/getUserProfile";
import { StoreRepliedToUserReview } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import mongoose from "mongoose";

async function storeReplyToUserReviewConsumer(event: StoreRepliedToUserReview) {
  const {
    review: { _id, writer, reviewedResourceId, storeOrProduct },
  } = event.payload;

  const documentStoreOrProduct = await getOneDocById(mongoose.model(storeOrProduct), reviewedResourceId);
  const storeName = documentStoreOrProduct.storeName || documentStoreOrProduct.store.storeName; // StoreDocument || ProductDocument;

  const userResult = await getUserProfile(writer);

  const email = userResult.ok ? userResult.result.email : "";
  const novuResult = await novuStoreReplyToUserReview({ reviewId: (_id as string).toString(), storeName, userId: (writer as string).toString(), email });
  if (novuResult.ok) return new Success({ serviceName: "novu", ack: true });

  return new Failure(novuResult.message, { serviceName: "novu", ack: false });
}

export default storeReplyToUserReviewConsumer;
