import express from "express";
import { createCoupon } from "../controllers/ControllCoupon";

const router = express.Router();

router.post("/newcoupon", createCoupon);


export default router;