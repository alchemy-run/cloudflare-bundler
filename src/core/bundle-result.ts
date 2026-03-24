import type { CfModuleType } from "./module-types.js";

export interface AdditionalModuleSourceMap {
  readonly name: string;
  readonly content: string;
}

export interface BundleModule {
  readonly name: string;
  readonly type: CfModuleType;
  readonly content: string | Uint8Array;
  readonly filePath?: string | undefined;
  readonly sourceMap?: AdditionalModuleSourceMap | undefined;
}

export interface BundleResult {
  readonly modules: ReadonlyArray<BundleModule>;
  readonly resolvedEntryPointPath: string;
  readonly bundleType: "esm" | "commonjs";
  readonly sourceMapPath?: string | undefined;
}
