import type { Miniflare } from "miniflare";
import { afterEach, describe, expect, it } from "vitest";
import {
  bundleWithWrangler,
  cleanupWranglerOutput,
  createWorker,
  readFixtureConfig,
  runAssertions,
} from "./harness.js";

import { assertions as additionalModulesAssertions } from "./fixtures/additional-modules/assertions.js";
import { assertions as basicWorkerAssertions } from "./fixtures/basic-worker/assertions.js";
import { assertions as cloudflareExternalsAssertions } from "./fixtures/cloudflare-externals/assertions.js";
import { assertions as definesAssertions } from "./fixtures/defines/assertions.js";
import { assertions as nodeCompatAssertions } from "./fixtures/node-compat/assertions.js";

interface FixtureDef {
  name: string;
  path: string;
  assertions: Array<{ path: string; mode: "text" | "json"; expected: unknown }>;
}

const fixtures: Array<FixtureDef> = [
  {
    name: "basic-worker",
    path: "./test/fixtures/basic-worker",
    assertions: basicWorkerAssertions,
  },
  {
    name: "additional-modules",
    path: "./test/fixtures/additional-modules",
    assertions: additionalModulesAssertions,
  },
  {
    name: "cloudflare-externals",
    path: "./test/fixtures/cloudflare-externals",
    assertions: cloudflareExternalsAssertions,
  },
  {
    name: "defines",
    path: "./test/fixtures/defines",
    assertions: definesAssertions,
  },
  {
    name: "node-compat",
    path: "./test/fixtures/node-compat",
    assertions: nodeCompatAssertions,
  },
];

describe.concurrent("wrangler (oracle)", () => {
  for (const fixture of fixtures) {
    describe(fixture.name, () => {
      let mf: Miniflare | undefined;
      afterEach(async () => {
        cleanupWranglerOutput(fixture.path);
        await mf?.dispose();
        mf = undefined;
      });

      it("bundles and runs correctly", async () => {
        const config = readFixtureConfig(fixture.path);
        const result = bundleWithWrangler(fixture.path);

        mf = await createWorker(result, config);

        const results = await runAssertions(mf, fixture.assertions);
        for (const r of results) {
          expect(r.actual, `GET ${r.path}`).toEqual(r.expected);
        }
      });
    });
  }
});
