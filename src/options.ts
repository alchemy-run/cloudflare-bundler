import {
  defaultModuleRules,
  resolveModuleRules,
  type ModuleRule,
} from "./core/module-rules.js";

export type CloudflareBundlerEnvironment = "development" | "production";

export interface CloudflareBundlerOptions {
  readonly entry: string;
  readonly compatibilityDate?: string | undefined;
  readonly compatibilityFlags?: ReadonlyArray<string> | undefined;
  readonly rules?: ReadonlyArray<ModuleRule> | undefined;
  readonly define?: Readonly<Record<string, string>> | undefined;
  readonly env?: CloudflareBundlerEnvironment | undefined;
}

export interface NormalizedCloudflareBundlerOptions {
  readonly entry: string;
  readonly compatibilityDate?: string | undefined;
  readonly compatibilityFlags: ReadonlyArray<string>;
  readonly rules: ReadonlyArray<ModuleRule>;
  readonly define: Readonly<Record<string, string>>;
  readonly env: CloudflareBundlerEnvironment;
}

export const defaultBuildConditions = ["workerd", "worker", "browser"] as const;

export function normalizeCloudflareBundlerOptions(
  options: CloudflareBundlerOptions
): NormalizedCloudflareBundlerOptions {
  if (options.entry.trim().length === 0) {
    throw new TypeError("`entry` must be a non-empty path.");
  }

  return {
    entry: options.entry,
    compatibilityDate: options.compatibilityDate,
    compatibilityFlags: options.compatibilityFlags ?? [],
    rules: resolveModuleRules(options.rules ?? defaultModuleRules),
    define: options.define ?? {},
    env: options.env ?? "production",
  };
}
