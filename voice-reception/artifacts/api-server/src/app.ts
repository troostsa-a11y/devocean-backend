import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { allowedOrigins, originAllowed, trustedProxies } from "./security/origins";
import { ingressGuard } from "./security/ingress";
import { openaiAccess } from "./security/openaiAccess";

const app: Express = express();
app.disable("x-powered-by");
app.set("trust proxy", trustedProxies());
const origins = allowedOrigins(); // Fail startup on unsafe origin configuration.

app.use(
  pinoHttp({
    logger,
    // Suppress Render's load-balancer health checks (every ~5 s) from logs.
    // They are zero-overhead 200s that add no signal; real errors still surface
    // because a non-2xx response bypasses this ignore function.
    autoLogging: {
      ignore: (req) =>
        (req.url === "/api/health" || req.url === "/healthz") &&
        req.method === "GET",
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use("/api", ingressGuard(), (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.headers.origin && !originAllowed(req.headers.origin)) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  next();
});
app.use("/api", cors({
  origin: (origin, callback) => callback(null, !!origin && origins.has(origin)),
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Conversation-Token"],
  exposedHeaders: ["Retry-After"],
  credentials: false,
  maxAge: 600,
}));
app.use("/api/openai", openaiAccess);
const normalJson = express.json({ limit: "32kb", inflate: false });
const audioJson = express.json({ limit: "3mb", inflate: false });
app.use("/api", (req, res, next) => {
  const legacyAudio = req.method === "POST" && /^\/openai\/conversations\/[^/]+\/voice-messages$/.test(req.path);
  (legacyAudio ? audioJson : normalJson)(req, res, next);
});
app.use("/api", express.urlencoded({ extended: false, limit: "8kb", parameterLimit: 20, inflate: false }));

// API routes
app.use("/api", router);
app.use("/api", (_req, res) => { res.status(404).json({ error: "Not found" }); });
app.use((err: { status?: number; type?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  const status = err.status === 413 ? 413 : err.status === 400 ? 400 : err.status === 415 ? 415 : 500;
  res.status(status).json({
    error: status === 413 ? "Request body too large" : status === 400 ? "Invalid request body" :
      status === 415 ? "Unsupported request encoding" : "Request could not be completed",
  });
});
app.use((_req, res, next) => {
  const frameOrigins = [...origins].join(" ");
  res.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${frameOrigins}`);
  next();
});

// Serve the receptionist Vite build (static frontend + widget-loader.js + /embed)
// Compiled output: voice-reception/artifacts/api-server/dist/index.mjs
// Receptionist dist: voice-reception/artifacts/receptionist/dist/public/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptDist = path.resolve(__dirname, "../../receptionist/dist/public");

// Only mount static serving + SPA fallback when the receptionist dist is present.
// In dev the receptionist Vite dev server (separate workflow) handles the frontend;
// the API server only needs to handle /api/* in that case.
if (existsSync(receptDist)) {
  app.use(express.static(receptDist, { index: "index.html" }));

  // SPA fallback — any path not matched by /api/* or a static file gets index.html
  // (handles client-side routes like /embed, /admin, etc.)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(receptDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  logger.warn({ receptDist }, "Receptionist dist not found — static serving skipped (dev mode)");
}

export default app;
