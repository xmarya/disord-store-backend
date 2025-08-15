import express from "express";
import isWriter from "../../../middlewares/protectors/isWriter";
import validateRequestParams from "../../../middlewares/validators/validateRequestParams";
import { deleteMyReviewController, getMyReviewsController, updateMyReviewController } from "../../../controllers/auth/reviews/publicReviewController";

export const router = express.Router();

router.get("/", getMyReviewsController);
router.route("/:reviewId").patch(validateRequestParams("reviewId"), isWriter, updateMyReviewController).delete(validateRequestParams("reviewId"), isWriter, deleteMyReviewController);
