import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";


async function deleteAllReviewsOfResource(resourceId:MongoId, session:mongoose.ClientSession){
      const safeDeleteAllReviews = safeThrowable(
        () => deleteAllResourceReviews(resourceId, session),
        (error) => new Failure((error as Error).message)
      );
    
      return extractSafeThrowableResult(() => safeDeleteAllReviews);
}

export default deleteAllReviewsOfResource