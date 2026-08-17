import type { NextConfig } from "next";

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
