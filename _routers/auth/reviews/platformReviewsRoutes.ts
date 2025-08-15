import express from "express";
import validateRequestParams from "../../../middlewares/validators/validateRequestParams";
import {
  createPlatformReviewController,
  deletePlatformReviewController,
  getAllPlatformReviewsController,
  getOnePlatformReviewController,
  updateMyPlatformReviewController,
} from "../../../controllers/auth/reviews/platformReviewController";
import restrict from "../../../middlewares/protectors/restrict";
import isWriter from "../../../middlewares/protectors/isWriter";
import sanitisedData from "../../../middlewares/validators/sanitisedData";

export const router = express.Router();

// This route is for all users -except admin- to write their reviews about the platform
router.use(restrict("storeOwner", "storeAssistant", "user"));

router.route("/").post(sanitisedData, createPlatformReviewController).get(getAllPlatformReviewsController);

router
  .route("/:reviewId")
  .get(validateRequestParams("reviewId"), getOnePlatformReviewController)
  .patch(validateRequestParams("reviewId"), isWriter, sanitisedData, updateMyPlatformReviewController)
  .delete(validateRequestParams("reviewId"), isWriter, deletePlatformReviewController);
