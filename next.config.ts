import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Turbopack doesn't fall back to
  // scanning parent directories for a lockfile (there's an unrelated stray
  // package-lock.json in the Windows user profile root).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // The export route reads docs/source/Case_Tracker_Copy.xlsx from disk at
  // request time; it's not imported, so file tracing wouldn't bundle it for
  // the deployed serverless function without this.
  outputFileTracingIncludes: {
    "/api/casing/export": ["./docs/source/Case_Tracker_Copy.xlsx"],
    "/api/pei/export": ["./docs/source/PEI_stories_template.docx"],
  },
};

export default nextConfig;
