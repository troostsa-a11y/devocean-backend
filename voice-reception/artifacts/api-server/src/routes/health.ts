import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getReadiness } from "../lib/readiness";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const readiness = getReadiness();
  if (readiness.status === "ready") {
    res.json(HealthCheckResponse.parse({ status: "ok" }));
  } else {
    res.status(503).json(HealthCheckResponse.parse({ status: readiness.status }));
  }
});

router.get("/health", (_req, res) => {
  const readiness = getReadiness();
  if (readiness.status === "ready") {
    res.json(HealthCheckResponse.parse({ status: "ok" }));
  } else {
    res.status(503).json(HealthCheckResponse.parse({ status: readiness.status }));
  }
});

export default router;
