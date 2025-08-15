import express from "express";
import restrict from "../../../middlewares/protectors/restrict";
import checkAssistantPermissions from "../../../middlewares/validators/validateAssistantPermissions";
import validateRequestParams from "../../../middlewares/validators/validateRequestParams";
import { addStoreReply } from "../../../controllers/auth/reviews/privateReviewController";
import canReplyToReview from "../../../middlewares/protectors/canReplyToReview";

export const router = express.Router();

router
  .route("/:reviewId/storeReply")
  .patch(restrict("storeOwner", "storeAssistant"), canReplyToReview, checkAssistantPermissions("replyToCustomers"), validateRequestParams("reviewId"), addStoreReply);

/* OLD CODE (kept for reference): 
// NOTE: this fallback middleware is necessary to not fallback to the store route /store/:storeId
// and produces CastError: Cast to ObjectId failed for value "reviews" (type string) at path "_id" for model "Store"
//  because the code proceeded hasAuthorization middleware.
router.all("/", (request, response, next) => {
  if (!["GET", "POST"].includes(request.method)) return next(new AppError(405, `${request.method} not allowed on /store/reviews. please provide a /:reviewId`));
  next();
});
*/
