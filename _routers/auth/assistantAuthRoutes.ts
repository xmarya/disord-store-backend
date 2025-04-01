import Router from "express";
import { restrict } from "../../controllers/auth/authController";
import { createAssistantController, deleteAssistantController, getAllAssistantsController, getOneAssistantController } from "../../controllers/auth/assistantAuthController";
export const router = Router();

console.log("assistant routes");

router.use(restrict("storeOwner"));

router.route("/").get(getAllAssistantsController).post(createAssistantController);
router.route("/:id").get(getOneAssistantController);
router.route("/:id").delete(deleteAssistantController);
