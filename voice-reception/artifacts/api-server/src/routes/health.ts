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

// Deployment version check — compare against `git log --oneline -1` to verify
// a push has reached Render. RENDER_GIT_COMMIT is injected automatically by
// Render on every deploy; it is undefined when running locally.
router.get("/api/version", (_req, res) => {
  res.json({
    service: "Receptionist",
    commit: process.env["RENDER_GIT_COMMIT"]?.slice(0, 7) ?? "local",
    commitFull: process.env["RENDER_GIT_COMMIT"] ?? null,
    branch: process.env["RENDER_GIT_BRANCH"] ?? "local",
    deployedAt: process.env["RENDER_INSTANCE_ID"] ? new Date().toISOString() : null,
  });
});

export default router;
