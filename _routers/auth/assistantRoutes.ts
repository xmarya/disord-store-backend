import express from "express";
import { createAssistantController, deleteAssistantController, getAllAssistantsController, getOneAssistantController, updateAssistantController } from "../../controllers/auth/assistantController";
import verifyUsedQuota from "../../middlewares/validators/verifyUsedQuota";
import restrict from "../../middlewares/protectors/restrict";
import validateNewUserData from "../../middlewares/validators/validateNewUserData";
import sanitisedData from "../../middlewares/validators/sanitisedData";
import validateEmailConfirmation from "../../middlewares/validators/validateEmailConfirmation";
import validateRequestParams from "../../middlewares/validators/validateRequestParams";
import isEmailExist from "../../middlewares/protectors/isEmailExist";

export const router = express.Router({ mergeParams: true });

router.use(validateEmailConfirmation);

router.use(restrict("storeOwner"));
router.route("/").get(getAllAssistantsController).post(verifyUsedQuota("ofStoreAssistants"), sanitisedData, validateNewUserData, createAssistantController);
router
  .route("/:assistantId")
  .get(validateRequestParams("assistantId"), getOneAssistantController)
  .patch(isEmailExist, validateRequestParams("assistantId"), updateAssistantController)
  .delete(validateRequestParams("assistantId"), deleteAssistantController);
