import express from "express";
import { createReviewOnModel, getAllReviewsOnModel } from "../../controllers/auth/reviewController";

export const router = express.Router({mergeParams: true});

// for stores and products
router.route("/",).post(createReviewOnModel).get(getAllReviewsOnModel);
// router.route("/platform",).post(createPlatformReview).get(getAllPlatformReviews);
router.route("/:id").get().patch().delete();