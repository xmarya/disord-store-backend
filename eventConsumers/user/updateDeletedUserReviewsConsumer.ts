import Review from "@models/reviewModel";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function updateDeletedUserReviewsConsumer(event: UserDeletedEvent) {
  const { userType, usersId } = event.payload;
  if (userType !== "user") return new Success({ serviceName: "reviewsCollection", ack: true });
  const writer = new mongoose.Types.ObjectId(usersId[0]);
  const safeUpdate = safeThrowable(
    () =>
      Review.updateMany(
        { writer },
        {
          $set: {
            firstName: "deleted user",
            image: "default.jpg",
          },
          $unset: {
            lastName: "",
          },
        }
      ),
    (error) => new Failure((error as Error).message)
  );

  const updateResult = await extractSafeThrowableResult(() => safeUpdate);
  if (!updateResult.ok) return new Failure(updateResult.message, { serviceName: "reviewsCollection", ack: false });

  return new Success({ serviceName: "reviewsCollection", ack: true });
}

export default updateDeletedUserReviewsConsumer;
