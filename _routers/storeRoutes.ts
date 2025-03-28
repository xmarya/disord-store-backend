import { createStore, deleteStore, getAllStores, getStore, updateStore } from '../controllers/storeControllers';
import { Router } from "express";

export const router = Router();

router.route("/").get(getAllStores);
router.route("/").post(createStore);
router.route("/:id").get(getStore);
router.route("/:id").post(updateStore);
router.route("/:id").delete(deleteStore);
