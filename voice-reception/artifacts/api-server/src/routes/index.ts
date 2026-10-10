import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import authRouter from "./auth";
import { adminAuth } from "../middleware/adminAuth";
import { openaiAccess } from "../security/openaiAccess";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/auth", authRouter);

router.use("/openai", openaiAccess, openaiRouter);

router.use("/bookings", adminAuth, bookingsRouter);
router.use("/stats", adminAuth, statsRouter);

export default router;
