import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.RECEPTION_DATABASE_URL) {
  throw new Error("RECEPTION_DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  // drizzle-kit prepends "./" when opening snapshots; an absolute out path
  // becomes ".//home/..." and cannot be read.
  out: path.relative(process.cwd(), path.join(__dirname, "./drizzle")) || ".",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.RECEPTION_DATABASE_URL,
  },
});
