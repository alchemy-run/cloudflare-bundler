export const moduleRuleTypes = [
  "ESModule",
  "CommonJS",
  "CompiledWasm",
  "Data",
  "Text",
  "PythonModule",
  "PythonRequirement",
] as const;

export type ModuleRuleType = (typeof moduleRuleTypes)[number];

export const additionalModuleRuleTypes = [
  "CompiledWasm",
  "Data",
  "Text",
] as const;

export type AdditionalModuleRuleType = (typeof additionalModuleRuleTypes)[number];

export const cfModuleTypes = [
  "esm",
  "commonjs",
  "compiled-wasm",
  "buffer",
  "text",
  "python",
  "python-requirement",
] as const;

export type CfModuleType = (typeof cfModuleTypes)[number];

export const ruleTypeToModuleType: Readonly<Record<ModuleRuleType, CfModuleType>> =
  {
    ESModule: "esm",
    CommonJS: "commonjs",
    CompiledWasm: "compiled-wasm",
    Data: "buffer",
    Text: "text",
    PythonModule: "python",
    PythonRequirement: "python-requirement",
  };

export function isAdditionalModuleRuleType(
  ruleType: ModuleRuleType
): ruleType is AdditionalModuleRuleType {
  return (additionalModuleRuleTypes as ReadonlyArray<string>).includes(ruleType);
}
