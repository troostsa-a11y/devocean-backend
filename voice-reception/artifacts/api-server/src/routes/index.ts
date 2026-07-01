import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import authRouter from "./auth";
import { adminAuth } from "../middleware/adminAuth";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/auth", authRouter);

router.use(
  "/openai",
  (req: Request, res: Response, next: NextFunction) => {
    const { method, path } = req;
    const isPublic =
      (method === "POST" && path === "/conversations") ||
      (method === "POST" && /^\/conversations\/\d+\/messages$/.test(path)) ||
      (method === "POST" && path.startsWith("/realtime/"));
    if (isPublic) return next();
    adminAuth(req, res, next);
  },
  openaiRouter,
);

router.use("/bookings", adminAuth, bookingsRouter);
router.use("/stats", adminAuth, statsRouter);

export default router;
