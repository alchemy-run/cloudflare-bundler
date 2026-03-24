import { createHash } from "node:crypto";
import path from "node:path";

export function createHashedFileName(
  filePath: string,
  content: string | Uint8Array
): string {
  const hash = createHash("sha1").update(content).digest("hex");
  return `${hash}-${path.basename(filePath)}`;
}
