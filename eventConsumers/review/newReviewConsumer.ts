import novuNewReview from "@externals/novu/workflowTriggers/newReview";
import StoreAssistant from "@models/storeAssistantModel";
import Store from "@models/storeModel";
import { getAllDocs, getOneDocById } from "@repositories/global";
import { ReviewCreated } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { ProductDocument } from "@Types/Schema/Product";
import { StoreDocument } from "@Types/Schema/Store";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";


async function newReviewNotificationConsumer(event:ReviewCreated) {
      const { _id, firstName, lastName, storeOrProduct,  reviewedResourceId} = event.payload.review;
  const reviewId = (_id as MongoId).toString();

  // I need to get the storeId in order to reach its owner and all assistants with replayToReview permission = true.
  const safeGetDocument = safeThrowable(
    () => getOneDocById(mongoose.model(storeOrProduct), reviewedResourceId),
    (error) => new Failure((error as Error).message)
  );

  const getResult = await extractSafeThrowableResult(() => safeGetDocument);
  if (!getResult.ok) return new Failure(getResult.message, { serviceName: "novu", ack: false });
  const document: StoreDocument | ProductDocument = getResult.result;

  const storeId: MongoId = "store" in document ? document.store : document.id;
  const safeGetStore = safeThrowable(
    () => getOneDocById(Store, storeId, { select: ["owner", "storeAssistants"] }),
    (error) => new Failure((error as Error).message)
  );
  const getStoreResult = await extractSafeThrowableResult(() => safeGetStore);
  if (!getStoreResult.ok) return new Failure(getStoreResult.message, { serviceName: "novu", ack: false });

  const { owner, storeAssistants } = getStoreResult.result;
  const canReplyAssistants = await getAllDocs(StoreAssistant, {}, { condition: { _id: { $in: storeAssistants }, "permissions.replyToCustomers": true }, select: ["id"] });

  const assistants = canReplyAssistants.map((assistant) => assistant?.id);
  const subscribers = [owner.toString(), ...assistants];

  const novuResult = await novuNewReview(reviewId, subscribers, `${firstName} ${lastName}`);
  if (!novuResult.ok) return new Failure(novuResult.message, { serviceName: "novu", ack: false });

  return new Success({ serviceName: "novu", ack: true });

}

export default newReviewNotificationConsumer;