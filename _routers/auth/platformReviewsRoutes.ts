import express from "express";
import validateRequestParams from "../../_utils/validators/validateRequestParams";
import { isWriter, restrict } from "../../controllers/auth/authController";
import { createPlatformReviewController, deletePlatformReviewController, getAllPlatformReviewsController, getOnePlatformReviewController, updatePlatformReviewController } from "../../controllers/auth/reviewController";

export const router = express.Router();

router.use(restrict("storeOwner", "storeAssistant", "user"));
//for platform:
router.route("/")
.post(createPlatformReviewController)
.get(getAllPlatformReviewsController);

router.route("/:reviewId")
.get(validateRequestParams("reviewId"),getOnePlatformReviewController)
.patch(validateRequestParams("reviewId"),isWriter, updatePlatformReviewController)
.delete(validateRequestParams("reviewId"),isWriter, deletePlatformReviewController);
