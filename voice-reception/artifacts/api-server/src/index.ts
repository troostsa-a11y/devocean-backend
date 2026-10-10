import { createServer } from "node:http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { setReady, setFailed } from "./lib/readiness.js";
import { runMigrations } from "./migrate.js";
import { attachRealtimeGateway } from "./security/realtimeGateway.js";
import { cleanupAbuseState } from "./security/abuse.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Use createServer so we can intercept WebSocket upgrade events
const server = createServer(app);
server.headersTimeout = 10_000;
server.requestTimeout = 30_000;

// WebSocket relay: browser ↔ this server ↔ OpenAI Realtime API
attachRealtimeGateway(server);

server.on("error", (err) => {
  logger.error({ err }, "Server error");
  process.exit(1);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening — running migrations in background");
});

runMigrations()
  .then(() => {
    setReady();
    void cleanupAbuseState().catch(() => logger.warn("Abuse state cleanup temporarily unavailable"));
    const cleanup = setInterval(() => {
      void cleanupAbuseState().catch(() => logger.warn("Abuse state cleanup temporarily unavailable"));
    }, 60 * 60_000);
    cleanup.unref();
    logger.info("Migrations complete — server is ready");
  })
  .catch((err) => {
    setFailed(err);
    logger.error({ err }, "Migration failed — shutting down");
    process.exit(1);
  });
