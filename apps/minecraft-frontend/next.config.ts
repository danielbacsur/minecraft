import { type NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  reactCompiler: true,
  transpilePackages: ["@minecraft/auth", "@minecraft/postgres"],
};

export default config;
