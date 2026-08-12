import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/schema.ts",
  out: "migrations",

  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
});
