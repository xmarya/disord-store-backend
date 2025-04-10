import express from "express";
import { isStoreIdExist, restrict } from "../../controllers/auth/authController";
import { createAssistantController, deleteAssistantController, getAllAssistantsController, getOneAssistantController } from "../../controllers/auth/assistantController";

export const router = express.Router({mergeParams: true});

router.use(isStoreIdExist); // this middleware is used to ensure the storeId is exist before proceeding.

router.use(restrict("storeOwner"));

router.route("/").get(getAllAssistantsController).post(createAssistantController);
router.route("/:id").get(getOneAssistantController);
router.route("/:id").delete(deleteAssistantController);
