import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { setReady, setFailed } from "./lib/readiness.js";
import { runMigrations } from "./migrate.js";
import { handleRealtimeWs } from "./routes/openaiRealtimeRelay.js";

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

// WebSocket relay: browser ↔ this server ↔ OpenAI Realtime API
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/api/openai/realtime/ws")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleRealtimeWs(ws);
    });
  } else {
    socket.destroy();
  }
});

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
    logger.info("Migrations complete — server is ready");
  })
  .catch((err) => {
    setFailed(err);
    logger.error({ err }, "Migration failed — shutting down");
    process.exit(1);
  });
