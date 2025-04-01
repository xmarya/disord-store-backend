import { Router } from "express";
import { deleteStore } from "../../controllers/auth/storeControllers";
import { getAllStores } from "../../controllers/auth/adminController";

export const router = Router();

// NOTE: add protect + restrict later
router.route("/").get(getAllStores);
router.route("/:id").delete(deleteStore);
