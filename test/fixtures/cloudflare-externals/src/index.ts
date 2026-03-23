import { DurableObject } from "cloudflare:workers";

export class Counter extends DurableObject {
	private count = 0;

	async increment(): Promise<number> {
		return ++this.count;
	}
}

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/":
				return Response.json({
					hasDurableObject: typeof DurableObject === "function",
				});
			default:
				return new Response(null, { status: 404 });
		}
	},
} satisfies ExportedHandler;
