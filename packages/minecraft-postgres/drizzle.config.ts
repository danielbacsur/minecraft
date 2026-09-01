import { existsSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "drizzle-kit";

const path = join(process.cwd(), "../../.env");
if (existsSync(path)) process.loadEnvFile(path);

export default defineConfig({
  dialect: "postgresql",
  schema: "src/schema.ts",
  out: "migrations",

  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
});
