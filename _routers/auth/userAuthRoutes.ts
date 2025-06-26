import express from "express";
import restrict from "../../_utils/protectors/restrict";
import sanitisedData from "../../_utils/validators/sanitisedData";
import { cancelSubscriptionController, createNewSubscribeController, renewalSubscriptionController } from "../../controllers/auth/subscriptionController";
import { getMySubscriptionsLogController } from "../../controllers/auth/userAuthController";
import { router as cartRouter } from "./cartRouter";
import { router as wishlistRouter } from "./wishlistRouter";

export const router = express.Router();
console.log("/me Router");

router.use("/wish-list", restrict("user"), wishlistRouter);
router.use("/cart", restrict("user"), cartRouter)

router.use(restrict("storeOwner"));
router.route("/subscriptions").get(getMySubscriptionsLogController);

router.use(sanitisedData);
router.patch("/new-subscribe", createNewSubscribeController); /*✅*/
router.patch("/plan-renewal", renewalSubscriptionController); // TODO: renewal subscription controller (check if the user selected the same plan or upgraded it)
/* CHANGE LATER: the above two must have a controller for the payment as the first md before proceeding to the updating */
router.patch("/plan-unsubscribe", cancelSubscriptionController); // TODO: unsubscription controller, maybe we should check if the subscription has been less than 15 days

