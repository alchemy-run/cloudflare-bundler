import globToRegExp from "glob-to-regexp";
import type { ModuleRuleType } from "./module-types.js";

export interface ModuleRule {
  readonly type: ModuleRuleType;
  readonly globs: ReadonlyArray<string>;
  readonly fallthrough?: boolean | undefined;
}

export interface CompiledModuleRule extends ModuleRule {
  readonly matchers: ReadonlyArray<RegExp>;
}

export const defaultModuleRules = [
  {
    type: "Text",
    globs: ["**/*.txt", "**/*.html", "**/*.sql"],
  },
  {
    type: "Data",
    globs: ["**/*.bin"],
  },
  {
    type: "CompiledWasm",
    globs: ["**/*.wasm"],
  },
] as const satisfies ReadonlyArray<ModuleRule>;

export function resolveModuleRules(
  rules: ReadonlyArray<ModuleRule>
): ReadonlyArray<ModuleRule> {
  const resolved: Array<ModuleRule> = [];
  const blockedTypes = new Set<ModuleRuleType>();

  for (const rule of rules) {
    if (blockedTypes.has(rule.type)) {
      continue;
    }

    resolved.push(rule);

    if (rule.fallthrough !== true) {
      blockedTypes.add(rule.type);
    }
  }

  return resolved;
}

export function compileModuleRules(
  rules: ReadonlyArray<ModuleRule>
): ReadonlyArray<CompiledModuleRule> {
  return rules.map((rule) => ({
    ...rule,
    matchers: rule.globs.map((glob) =>
      globToRegExp(glob, { extended: true, globstar: true })
    ),
  }));
}

export function matchModuleRule(
  filePath: string,
  rules: ReadonlyArray<ModuleRule>
): ModuleRule | undefined {
  const normalizedFilePath = normalizeModulePath(stripModuleQuery(filePath));

  for (const rule of compileModuleRules(resolveModuleRules(rules))) {
    if (rule.matchers.some((matcher) => matcher.test(normalizedFilePath))) {
      return rule;
    }
  }

  return undefined;
}

export function normalizeModulePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

export function stripModuleQuery(filePath: string): string {
  return filePath.endsWith("?module") ? filePath.slice(0, -"?module".length) : filePath;
}
