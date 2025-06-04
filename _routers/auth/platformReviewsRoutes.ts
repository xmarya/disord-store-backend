import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { createPlatformReviewController, deletePlatformReviewController, getAllPlatformReviewsController, getOnePlatformReviewController, updatePlatformReviewController } from "../../controllers/auth/reviewController";
import restrict from "../../_utils/protectors/restrict";
import isWriter from "../../_utils/protectors/isWriter";
import sanitisedData from "../../_utils/validators/sanitisedData";

export const router = express.Router();

// This route is for all users -except admin- to write their reviews about the platform
router.use(restrict("storeOwner", "storeAssistant", "user"));
//for platform:
router.route("/")
.post(sanitisedData,createPlatformReviewController);

router.route("/:reviewId")
.get(validateRequestParams("reviewId"),getOnePlatformReviewController)
.patch(validateRequestParams("reviewId"),isWriter, sanitisedData, updatePlatformReviewController)
.delete(validateRequestParams("reviewId"),isWriter, deletePlatformReviewController);
