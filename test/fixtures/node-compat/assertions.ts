import type { Assertion } from "../../harness.js";

export const assertions: Array<Assertion> = [
  { path: "/", mode: "text", expected: "OK!" },
  {
    path: "/buffer",
    mode: "json",
    expected: {
      isBuffer: true,
      length: 11,
      hex: "68656c6c6f20776f726c64",
    },
  },
  {
    path: "/crypto",
    mode: "json",
    expected: {
      hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    },
  },
  {
    path: "/als",
    mode: "json",
    expected: { value: "test-value" },
  },
  {
    path: "/process",
    mode: "json",
    expected: {
      hasProcess: true,
      hasVersions: true,
    },
  },
];
