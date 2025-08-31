import express from "express";
import restrict from "../../middlewares/protectors/restrict";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import { cancelSubscriptionController, createNewSubscribeController, getMySubscriptionsLogController, renewalSubscriptionController } from "../../controllers/auth/subscriptionController";

export const router = express.Router();

router.use(restrict("storeOwner"));
router.route("/").get(getMySubscriptionsLogController);

router.use(sanitisedData);
router.patch("/newSubscribe", createNewSubscribeController);
router.patch("/renewal", renewalSubscriptionController);
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/unsubscribe", cancelSubscriptionController);
