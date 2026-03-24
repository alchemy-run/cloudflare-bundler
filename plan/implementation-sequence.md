# Implementation Sequence

This document turns the research in [PRD.md](/Users/john/Developer/Alchemy/cloudflare-bundler/plan/PRD.md), [research-01-wrangler.md](/Users/john/Developer/Alchemy/cloudflare-bundler/plan/research-01-wrangler.md), and [research-02-vite-plugin.md](/Users/john/Developer/Alchemy/cloudflare-bundler/plan/research-02-vite-plugin.md) into a concrete execution order for `@distilled.cloud/cloudflare-bundler`.

The goal is to avoid importing all Wrangler complexity up front. We should build the smallest production bundling pipeline that has a plausible path to parity, then layer in the harder compatibility features in a controlled order.

## Guiding Decisions

1. Start with **ESM-only** Workers.
2. Treat the Vite plugin as the main architectural template for the bundling core.
3. Treat Wrangler as the source of truth for behaviors the Vite plugin does not cover.
4. Prioritize **production bundling parity** before dev-time middleware and DX features.
5. Optimize for a core that can be shared across adapters rather than implementing one bundler end-to-end and backfilling abstractions later.

## Explicit Non-Goals For The First Cut

- Service-worker/IIFE output
- Wrangler dev middleware parity
- `checked-fetch`
- Python Workers
- Legacy Wrangler 1.x module behavior
- Workers Sites / `__STATIC_CONTENT_MANIFEST`
- Full fixture-porting from `workers-sdk` on day one

These are not unimportant. They are just bad starting points for a greenfield core.

## Target Architecture

We should build around a small set of layers:

### 1. Core domain

Owns shared types and pure logic:

- worker entry config
- module rules
- additional-module discovery
- compatibility flags and feature switches
- source-map metadata
- bundle manifest / output description

This layer should not know about esbuild, Rolldown, or unplugin.

### 2. Cloudflare bundling core

Owns Workers-specific behavior that is bundler-facing but adapter-agnostic:

- additional module classification
- virtual entry generation
- `cloudflare:*` external handling
- Node.js compat integration data
- `process.env.NODE_ENV` defines
- `.wasm?init` helper generation

This layer can expose factories/helpers consumed by the plugin and adapters.

### 3. Unplugin-based plugin

Owns Rollup-style hooks:

- `resolveId`
- `load`
- `renderChunk`

This is the main reusable plugin surface for Rolldown and other compatible bundlers.

### 4. Bundler adapters

Owns bundler-specific entry points and option mapping:

- `esbuild`
- `rolldown`
- later: `rspack`

The adapters should translate from our public API into the bundling core plus bundler-native configuration.

### 5. Test and benchmark harness

Owns parity validation:

- build with upstream tool
- build with this project
- run both in Miniflare
- compare runtime assertions
- measure build timings

## Recommended Build Order

## Phase 0: Lock Scope And Create The Skeleton

Deliverables:

- Define the package/module layout under `src/`
- Write a short feature matrix doc that labels each researched behavior as:
  - `v0`
  - `v1`
  - `defer`
- Replace the placeholder entrypoint with explicit exports for planned public surfaces

Acceptance criteria:

- The repo structure reflects the intended architecture
- There is a written boundary between the pure core, plugin logic, and bundler adapters
- We can point to a concrete list of what the first implementation will and will not do

Notes:

- This is where we should choose the first public API shape, but keep it narrow.
- Avoid promising a final API for adapters we have not implemented yet.

## Phase 1: Core Types And Pure Logic

Implement first:

- rule definitions and default module rules
- additional module type mapping
- filesystem-based module discovery helpers
- deterministic file naming strategy
- bundle manifest/result types
- Worker entry and output config types

Acceptance criteria:

- Pure unit tests cover the rule system and file classification
- We can classify `.wasm`, `.bin`, `.txt`, `.html`, and `.sql` consistently
- We can produce a stable output description without invoking a bundler

Why this phase exists:

- The research already shows that Wrangler and the Vite plugin disagree mainly in execution model, not in the underlying Cloudflare concepts.
- We need those concepts isolated before any adapter code starts accumulating.

## Phase 2: Unplugin Core For ESM Production Builds

Implement first:

- virtual entry module generation
- additional-modules plugin behavior using the Vite plugin pattern
- `cloudflare:*` external handling
- `.wasm?init` helper
- `process.env.NODE_ENV` define support

Defer inside this phase:

- config-driven middleware
- service-worker behavior
- advanced source-map normalization

Acceptance criteria:

- A simple ESM Worker bundles successfully through a Rollup-compatible flow
- Imported `.wasm`, `.bin`, `.txt`, `.html`, and `.sql` files are emitted and referenced correctly
- The plugin preserves user exports and default export behavior

Implementation bias:

- Follow the Vite plugin pattern for additional modules almost directly.
- Keep the plugin state small and explicit.
- Prefer virtual modules over temp-file generation wherever possible.

## Phase 3: Node.js Compat For V2 Mode Only

Implement:

- `unenv` + `@cloudflare/unenv-preset` integration
- alias resolution for Node polyfills
- global injection virtual modules
- warning path for Node imports when compat is not enabled

Defer:

- v1 compat
- ALS-only mode unless it falls out cheaply
- complex CommonJS edge cases beyond what the target bundler already supports

Acceptance criteria:

- `nodejs_compat`-style builds resolve standard polyfills
- globals like `Buffer` and `process` are injected before user code
- unsupported Node imports produce actionable warnings when compat is off

Risk note:

- This is one of the most likely areas to require adapter-specific handling, especially around `require()` behavior.

## Phase 4: First Adapter Surface

Implement two public entry points in this order:

1. `rolldown`
2. `esbuild`

Why this order:

- The unplugin core maps naturally to Rolldown.
- Esbuild likely needs more bespoke handling, especially for asset collection and virtual module behavior.

For the Rolldown adapter:

- expose a small helper that returns plugin(s) plus recommended build settings
- set target to `es2024`
- set strict entry signature preservation where supported
- apply Worker-oriented conditions

For the esbuild adapter:

- do not force a full parity story in the first pass
- support the same module rules and Node compat concepts, even if the mechanics differ internally
- prefer a clear adapter boundary over pretending unplugin is enough for esbuild

Acceptance criteria:

- Both adapters can build the same simple ESM Worker project
- Their outputs can run in Miniflare
- The public API remains obviously experimental and bounded

## Phase 5: Runtime Parity Harness

Implement:

- Miniflare-based runner
- fixture format for source input plus request/response assertions
- dual-run harness:
  - upstream reference build
  - local build

Start with a tiny curated fixture set:

- basic fetch worker
- text import
- wasm import
- Node compat example
- `cloudflare:*` import

Acceptance criteria:

- We can verify runtime behavior, not just inspect bundle output
- A failing parity case is localized to a fixture and easy to reproduce

Notes:

- This should happen before broad fixture import from `workers-sdk`.
- The harness matters more than the number of fixtures at this stage.

## Phase 6: Expand Toward Wrangler-Only Features

Implement next, in roughly this order:

1. configurable module rules with fallthrough behavior
2. `find_additional_modules`
3. `--no-bundle` style workflows
4. export validation for Durable Objects and Workflows
5. source-map attachment/normalization for additional modules

Acceptance criteria:

- We cover the main behavior gaps between the Vite plugin model and Wrangler's deployment model
- The bundle result format is rich enough for deployment-oriented tooling, not just build tooling

## Phase 7: Broader Fixture Port And Benchmarks

Implement:

- adapt selected `workers-sdk` fixtures into the local harness
- categorize fixtures by support level
- add benchmark runs for at least:
  - `wrangler`
  - local Rolldown adapter
  - local esbuild adapter

Acceptance criteria:

- We can state parity progress with concrete numbers
- We can state performance tradeoffs with repeatable measurements

## Public API Recommendation

Keep the initial public API narrow. A reasonable first shape is:

```ts
export interface CloudflareBundlerOptions {
  entry: string;
  compatibilityDate?: string;
  compatibilityFlags?: ReadonlyArray<string>;
  rules?: ReadonlyArray<ModuleRule>;
  define?: Record<string, string>;
  env?: "development" | "production";
}

export declare function cloudflareBundler(
  options: CloudflareBundlerOptions
): UnpluginInstance;

export declare function cloudflareRolldown(
  options: CloudflareBundlerOptions
): RolldownPlugin[];

export declare function cloudflareEsbuild(
  options: CloudflareBundlerOptions
): EsbuildAdapter;
```

The exact signatures can change, but the important constraint is this:

- one shared options object
- one core plugin entry
- thin bundler-specific wrappers

## Codebase Layout Recommendation

One reasonable first structure:

```txt
src/
  index.ts
  core/
    bundle-result.ts
    entry.ts
    module-rules.ts
    module-types.ts
    additional-modules.ts
    file-naming.ts
  plugin/
    cloudflare-bundler.ts
    virtual-modules.ts
    additional-modules.ts
    wasm-init.ts
    cloudflare-internal.ts
    nodejs-compat.ts
  adapters/
    rolldown.ts
    esbuild.ts
  runtime/
    templates/
  test/
    fixtures/
    harness/
```

This does not need to be final. It just gives us a place to start without mixing pure logic, plugin logic, and adapter code in one file tree.

## Immediate Next Tasks

If we start implementation now, the next concrete tasks should be:

1. Replace `src/index.ts` with a real export surface and module layout.
2. Implement the core module rule system and default rule set.
3. Implement the additional-modules unplugin path for ESM builds.
4. Add one Rolldown smoke test that bundles a Worker with a text import.
5. Add one Miniflare runtime test for the built output.

That sequence keeps the critical path short and gives us an end-to-end proof before we invest in the harder Wrangler parity features.
