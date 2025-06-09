import express from "express";
import { createReviewOnModelController, deleteReviewController, getAllReviewsController, getOneReviewController, updateReviewController } from "../../controllers/auth/reviewController";
import { AppError } from "../../_utils/AppError";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import canWriteReview from "../../_utils/protectors/canWriteReview";
import isWriter from "../../_utils/protectors/isWriter";

export const router = express.Router({mergeParams: true});


router.use(canWriteReview);

// NOTE: this fallback middleware is necessary to not fallback to the store route /store/:storeId
// and produces CastError: Cast to ObjectId failed for value "reviews" (type string) at path "_id" for model "Store"
//  because the code proceeded hasAuthorization middleware.
router.all("/", (request, response, next) => {
  if (!["GET", "POST"].includes(request.method)) return next(new AppError(405, `${request.method} not allowed on /store/reviews. please provide a /:reviewId`));
  next();
});
router.route("/").post(createReviewOnModelController).get(getAllReviewsController); // FIX: what king of reviews should getAllReviewsController returns ???
router
  .route("/:reviewId")
  .get(validateRequestParams("reviewId"), getOneReviewController)
  .patch(validateRequestParams("reviewId"), isWriter, updateReviewController)
  .delete(validateRequestParams("reviewId"), isWriter, deleteReviewController);

/*
case 1)
    request full route => /product/reviews || /store/reviews
    request.body => {
        modelId: that specific product/store id
        reviewBody: "",
        rating: 
    }

case 2)
    request full route => /product/reviews/:reviewId || /store/reviews/:reviewId
    request.body => {
        modelId: that specific product/store id
        reviewBody: "",
        rating: 
    }
    Review-product-${request.body.modelId}.findById(request.params.reviewId);
    Review-store-${request.body.modelId}.findById(request.params.reviewId);
*/
