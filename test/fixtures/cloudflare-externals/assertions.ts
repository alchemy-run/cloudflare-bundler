import type { Assertion } from "../../harness.js";

export const assertions: Array<Assertion> = [
  {
    path: "/",
    mode: "json",
    expected: { hasDurableObject: true },
  },
];
