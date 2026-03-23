import bin from "./modules/bin-example.bin";
import html from "./modules/html-example.html";
import sql from "./modules/sql-example.sql";
import text from "./modules/text-example.txt";
import wasm from "./modules/wasm-example.wasm";

interface Instance {
	exports: {
		add(a: number, b: number): number;
	};
}

export default {
	async fetch(request) {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/bin": {
				return Response.json({ byteLength: bin.byteLength });
			}
			case "/html": {
				return new Response(html, {
					headers: { "Content-Type": "text/html" },
				});
			}
			case "/text": {
				return new Response(text);
			}
			case "/sql": {
				return new Response(sql);
			}
			case "/wasm": {
				const instance = (await WebAssembly.instantiate(wasm)) as Instance;
				const result = instance.exports.add(3, 4);
				return Response.json({ result });
			}
			default: {
				return new Response(null, { status: 404 });
			}
		}
	},
} satisfies ExportedHandler;
