import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  defaultModuleRules,
  matchModuleRule,
  normalizeModulePath,
  type ModuleRule,
} from "./module-rules.js";
import {
  isAdditionalModuleRuleType,
  ruleTypeToModuleType,
  type AdditionalModuleRuleType,
  type CfModuleType,
} from "./module-types.js";

export interface AdditionalModule {
  readonly filePath: string;
  readonly relativePath: string;
  readonly ruleType: AdditionalModuleRuleType;
  readonly moduleType: CfModuleType;
}

const ignoredDirectoryNames = new Set([".git", ".wrangler", "node_modules"]);

export function classifyAdditionalModule(
  filePath: string,
  rules: ReadonlyArray<ModuleRule> = defaultModuleRules
): AdditionalModule | undefined {
  const matchedRule = matchModuleRule(filePath, rules);

  if (!matchedRule || !isAdditionalModuleRuleType(matchedRule.type)) {
    return undefined;
  }

  const normalizedFilePath = normalizeModulePath(filePath);

  return {
    filePath: normalizedFilePath,
    relativePath: normalizedFilePath,
    ruleType: matchedRule.type,
    moduleType: ruleTypeToModuleType[matchedRule.type],
  };
}

export async function findAdditionalModules(
  rootDirectory: string,
  rules: ReadonlyArray<ModuleRule> = defaultModuleRules
): Promise<ReadonlyArray<AdditionalModule>> {
  const discovered = new Array<AdditionalModule>();
  await walkDirectory(rootDirectory, async (filePath) => {
    const classified = classifyAdditionalModule(
      path.relative(rootDirectory, filePath),
      rules
    );

    if (!classified) {
      return;
    }

    discovered.push({
      ...classified,
      filePath: normalizeModulePath(filePath),
      relativePath: normalizeModulePath(path.relative(rootDirectory, filePath)),
    });
  });

  discovered.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return discovered;
}

async function walkDirectory(
  directoryPath: string,
  onFile: (filePath: string) => Promise<void>
): Promise<void> {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      await walkDirectory(path.join(directoryPath, entry.name), onFile);
      continue;
    }

    if (entry.isFile()) {
      await onFile(path.join(directoryPath, entry.name));
    }
  }
}
