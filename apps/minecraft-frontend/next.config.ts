import { existsSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

const path = join(process.cwd(), "../../.env");
if (existsSync(path)) process.loadEnvFile(path);

const config: NextConfig = {
  devIndicators: false,
  reactCompiler: true,
  transpilePackages: [
    "@minecraft/auth",
    "@minecraft/corpus",
    "@minecraft/postgres",
  ],
};

export default config;
