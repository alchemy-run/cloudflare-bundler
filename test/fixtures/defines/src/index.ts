declare const MY_CONSTANT: string;

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/":
				return Response.json({
					myConstant: MY_CONSTANT,
					nodeEnv: process.env.NODE_ENV,
				});
			default:
				return new Response(null, { status: 404 });
		}
	},
} satisfies ExportedHandler;
