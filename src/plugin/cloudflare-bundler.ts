import { createUnplugin, type UnpluginInstance } from "unplugin";
import {
  normalizeCloudflareBundlerOptions,
  type CloudflareBundlerOptions,
} from "../options.js";

export const cloudflareBundlerPluginName = "cloudflare-bundler";

export const cloudflareBundler: UnpluginInstance<CloudflareBundlerOptions, false> =
  createUnplugin<CloudflareBundlerOptions, false>((options) => {
    const normalizedOptions = normalizeCloudflareBundlerOptions(options);
    void normalizedOptions;

    return {
      name: cloudflareBundlerPluginName,
    };
  });
