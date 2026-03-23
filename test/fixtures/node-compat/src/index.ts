import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/": {
				return new Response("OK!");
			}
			case "/buffer": {
				const buf = Buffer.from("hello world");
				return Response.json({
					isBuffer: Buffer.isBuffer(buf),
					length: buf.length,
					hex: buf.toString("hex"),
				});
			}
			case "/crypto": {
				const hash = createHash("sha256")
					.update("hello world")
					.digest("hex");
				return Response.json({ hash });
			}
			case "/als": {
				const storage = new AsyncLocalStorage<string>();
				const result = storage.run("test-value", () => {
					return storage.getStore();
				});
				return Response.json({ value: result });
			}
			case "/process": {
				return Response.json({
					hasProcess: typeof process !== "undefined",
					hasVersions: typeof process.versions === "object",
				});
			}
			default: {
				return new Response(null, { status: 404 });
			}
		}
	},
} satisfies ExportedHandler;
