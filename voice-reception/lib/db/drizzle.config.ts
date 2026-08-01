import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.RECEPTION_DATABASE_URL) {
  throw new Error("RECEPTION_DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: path.join(__dirname, "./drizzle"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.RECEPTION_DATABASE_URL,
  },
});
