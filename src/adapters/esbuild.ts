import type { Plugin as EsbuildPlugin } from "esbuild";
import { cloudflareBundler } from "../plugin/cloudflare-bundler.js";
import type { CloudflareBundlerOptions } from "../options.js";

export function cloudflareEsbuild(
  options: CloudflareBundlerOptions
): EsbuildPlugin {
  return cloudflareBundler.esbuild(options);
}
