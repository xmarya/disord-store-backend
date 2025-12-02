import { setRanking } from "@repositories/ranking/rankingRepo";
import { calculateRatingsAverage } from "@repositories/review/reviewRepo";
import { ReviewCreated, ReviewUpdatedOrDeleted } from "@Types/events/ReviewEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { startSession } from "mongoose";

async function setResourceRatingConsumer(event: ReviewCreated | ReviewUpdatedOrDeleted) {
  const { storeOrProduct, reviewedResourceId } = (event as ReviewCreated).payload.review ?? event.payload;
  const session = await startSession();

  try {
    session.startTransaction();
    await calculateRatingsAverage(storeOrProduct, reviewedResourceId, session);
    await setRanking(storeOrProduct, session);
    await session.commitTransaction();

    return new Success({ serviceName: "setRanking", ack: true });
  } catch (error) {
    await session.abortTransaction();
    return new Failure((error as Error).message, { serviceName: "setRanking", ack: true });
  } finally {
    await session.endSession();
  }
}

export default setResourceRatingConsumer;
