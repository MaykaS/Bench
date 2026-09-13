import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Turbopack doesn't fall back to
  // scanning parent directories for a lockfile (there's an unrelated stray
  // package-lock.json in the Windows user profile root).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
