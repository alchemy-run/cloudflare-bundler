import type { Plugin as RolldownPlugin } from "rolldown";
import { cloudflareBundler } from "../plugin/cloudflare-bundler.js";
import type { CloudflareBundlerOptions } from "../options.js";

export function cloudflareRolldown(
  options: CloudflareBundlerOptions
): RolldownPlugin {
  return cloudflareBundler.rolldown(options);
}
