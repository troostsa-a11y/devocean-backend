import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
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
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API routes
app.use("/api", router);

// Serve the receptionist Vite build (static frontend + widget-loader.js + /embed)
// Compiled output: voice-reception/artifacts/api-server/dist/index.mjs
// Receptionist dist: voice-reception/artifacts/receptionist/dist/public/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptDist = path.resolve(__dirname, "../../receptionist/dist/public");
app.use(express.static(receptDist, { index: "index.html" }));

// SPA fallback — any path not matched by /api/* or a static file gets index.html
// (handles client-side routes like /embed, /admin, etc.)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(receptDist, "index.html"), (err) => {
    if (err) next(err);
  });
});

export default app;
