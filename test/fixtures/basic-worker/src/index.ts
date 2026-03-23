export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/":
				return new Response("ok");
			case "/json":
				return Response.json({ hello: "world" });
			default:
				return new Response(null, { status: 404 });
		}
	},
} satisfies ExportedHandler;
