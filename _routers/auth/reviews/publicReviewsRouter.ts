import express from "express";
import isWriter from "../../../_utils/protectors/isWriter";
import validateRequestParams from "../../../_utils/validators/validateRequestParams";
import { deleteMyReviewController, getMyReviewsController, updateMyReviewController } from "../../../controllers/auth/reviews/publicReviewController";

export const router = express.Router();

router.get("/", getMyReviewsController);
router
  .route("/:reviewId")
  .patch(validateRequestParams("reviewId"), isWriter, updateMyReviewController)
  .delete(validateRequestParams("reviewId"), isWriter, deleteMyReviewController);