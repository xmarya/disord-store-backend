import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { setRanking } from "@repositories/ranking/rankingRepo";
import { calculateRatingsAverage } from "@repositories/review/reviewRepo";
import { Model } from "@Types/Schema/Model";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import { err } from "neverthrow";

async function setResourceRating(Model: Extract<Model, "Store" | "Product">, resourceId: MongoId) {
  const session = await startSession();

  try {
    session.startTransaction();
    await calculateRatingsAverage(Model, resourceId, session);
    await setRanking(Model, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    err(INTERNAL_ERROR_MESSAGE);
  } finally {
    await session.endSession();
  }
}

export default setResourceRating;
