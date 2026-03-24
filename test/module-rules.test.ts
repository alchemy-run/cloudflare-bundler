import { describe, expect, it } from "vitest";
import {
  classifyAdditionalModule,
  createHashedFileName,
  defaultModuleRules,
  matchModuleRule,
  normalizeCloudflareBundlerOptions,
  resolveModuleRules,
} from "../src/index.js";

describe("module rules", () => {
  it("matches the default text rules", () => {
    const matchedRule = matchModuleRule("fixtures/template.html", defaultModuleRules);

    expect(matchedRule?.type).toBe("Text");
  });

  it("classifies wasm imports with the module query", () => {
    const classified = classifyAdditionalModule("fixtures/math.wasm?module");

    expect(classified).toEqual({
      filePath: "fixtures/math.wasm?module",
      relativePath: "fixtures/math.wasm?module",
      ruleType: "CompiledWasm",
      moduleType: "compiled-wasm",
    });
  });

  it("lets an earlier rule override a later rule of the same type", () => {
    const resolvedRules = resolveModuleRules([
      {
        type: "Text",
        globs: ["**/*.md"],
      },
      ...defaultModuleRules,
    ]);

    expect(matchModuleRule("docs/readme.md", resolvedRules)?.globs).toEqual(["**/*.md"]);
    expect(matchModuleRule("docs/index.html", resolvedRules)).toBeUndefined();
  });
});

describe("options", () => {
  it("normalizes defaults for the public options object", () => {
    const normalized = normalizeCloudflareBundlerOptions({
      entry: "./src/index.ts",
    });

    expect(normalized.env).toBe("production");
    expect(normalized.compatibilityFlags).toEqual([]);
    expect(normalized.rules).toHaveLength(defaultModuleRules.length);
  });
});

describe("file naming", () => {
  it("creates a stable hashed filename", () => {
    expect(createHashedFileName("fixtures/data.txt", "hello")).toBe(
      "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d-data.txt"
    );
  });
});
