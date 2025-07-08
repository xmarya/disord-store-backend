import express from "express";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import { cancelSubscriptionController, createNewSubscribeController, renewalSubscriptionController } from "../../controllers/auth/subscriptionController";
import { getMySubscriptionsLogController } from "../../controllers/auth/userAuthController";

export const router = express.Router();

router.use(restrict("storeOwner"));
router.route("/subscriptions").get(getMySubscriptionsLogController);

router.use(sanitisedData);
router.patch("/new-subscribe", createNewSubscribeController); /*✅*/
router.patch("/renewal", renewalSubscriptionController);
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/unsubscribe", cancelSubscriptionController);

