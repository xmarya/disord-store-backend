import express from "express";
import { createAssistantController, deleteAssistantController, getAllAssistantsController, getOneAssistantController } from "../../controllers/auth/assistantController";
import verifyUsedQuota from "../../_utils/validators/verifyUsedQuota";
import restrict from "../../_utils/protectors/restrict";
import validateNewUserData from "../../_utils/validators/validateNewUserData";
import sanitisedData from "../../_utils/validators/sanitisedData";
import validateEmailConfirmation from "../../_utils/validators/validateEmailConfirmation";

export const router = express.Router({mergeParams: true});

router.use(validateEmailConfirmation); 

router.use(restrict("storeOwner"));
router.route("/").get(getAllAssistantsController).post(verifyUsedQuota("ofStoreAssistants"),sanitisedData, validateNewUserData,createAssistantController);
router.route("/:id").get(getOneAssistantController);
router.route("/:id").delete(deleteAssistantController);
