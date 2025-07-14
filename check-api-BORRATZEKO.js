import http from "node:http";

console.log("Intentando conectar con API...");

// Opciones para la petición HTTP
const options = {
	hostname: "api",
	port: 8000,
	path: "/graphql/",
	method: "GET",
	timeout: 5000,
	headers: {
		"User-Agent": "Node-Diagnostic-Script",
	},
};

// Realizar la petición
const req = http.request(options, (res) => {
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

	let data = "";
	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		console.log("RESPUESTA COMPLETA:");
		console.log(data.substring(0, 500) + (data.length > 500 ? "..." : ""));
		console.log("\nConexión exitosa con API!");
	});
});

req.on("error", (e) => {
	console.error(`ERROR DE CONEXIÓN: ${e.message}`);
	console.error("Detalles completos del error:", e);
});

req.on("timeout", () => {
	console.error("TIMEOUT: La conexión ha tardado demasiado tiempo");
	req.destroy();
});

// Enviar la petición
req.end();

// También probar con localhost
setTimeout(() => {
	console.log("\n\nProbando conexión alternativa con localhost:8000...");

	const options2 = {
		...options,
		hostname: "localhost",
	};

	const req2 = http.request(options2, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		let data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});

		res.on("end", () => {
			console.log("RESPUESTA COMPLETA:");
			console.log(data.substring(0, 500) + (data.length > 500 ? "..." : ""));
			console.log("\nConexión exitosa con localhost!");
		});
	});

	req2.on("error", (e) => {
		console.error(`ERROR DE CONEXIÓN CON LOCALHOST: ${e.message}`);
	});

	req2.on("timeout", () => {
		console.error("TIMEOUT: La conexión con localhost ha tardado demasiado tiempo");
		req2.destroy();
	});

	req2.end();
}, 1000);
