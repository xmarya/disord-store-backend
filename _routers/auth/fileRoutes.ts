import { deleteFile } from "@controllers/auth/fileController";
import validateRequestParams from "@middlewares/validators/validateRequestParams";
import express from "express";

export const router = express.Router();


router.route("/:fileUrl").delete(validateRequestParams("fileUrl"), deleteFile);
