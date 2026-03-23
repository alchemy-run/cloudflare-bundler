import type { Assertion } from "../../harness.js";

export const assertions: Array<Assertion> = [
  { path: "/", mode: "text", expected: "ok" },
  { path: "/json", mode: "json", expected: { hello: "world" } },
];
