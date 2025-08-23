import { setRanking } from "@repositories/ranking/rankingRepo";
import { calculateRatingsAverage } from "@repositories/review/reviewRepo";
import { Model } from "@Types/Model";
import { MongoId } from "@Types/MongoId";
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
    err("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  } finally {
    await session.endSession();
  }
}

export default setResourceRating;
