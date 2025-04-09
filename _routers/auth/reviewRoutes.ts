import express from "express";
import {createReviewController, deleteReviewController, getAllReviewsController, getOneReviewController, updateReviewController } from "../../controllers/auth/reviewController";
import { isWriter } from "../../controllers/auth/authController";

export const router = express.Router({mergeParams: true});

// for stores and products:
router.route("/",).post(createReviewController).get(getAllReviewsController);
// router.route("/platform",).post(createPlatformReview).get(getAllPlatformReviews);
router.route("/:id").get(getOneReviewController).patch(isWriter, updateReviewController).delete(isWriter, deleteReviewController);

// for platform:
router.route("/platform").post(createReviewController).get(getAllReviewsController);
router.route("/platform/:id").get(getOneReviewController).patch(isWriter, updateReviewController).delete(isWriter, deleteReviewController);