import app from "./app";
import { logger } from "./lib/logger";
import { setReady, setFailed } from "./lib/readiness";
import { runMigrations } from "./migrate";

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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

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
