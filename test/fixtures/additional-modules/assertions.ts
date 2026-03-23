import type { Assertion } from "../../harness.js";

export const assertions: Array<Assertion> = [
  { path: "/bin", mode: "json", expected: { byteLength: 342936 } },
  { path: "/text", mode: "text", expected: "Example text content.\n" },
  { path: "/sql", mode: "text", expected: "SELECT * FROM users;\n" },
  { path: "/wasm", mode: "json", expected: { result: 7 } },
];
