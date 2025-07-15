// Archivo simplificado para desarrollo inicial

export type TypedDocumentString<Result = {}, Variables = {}> = string & {
	__apiType?: (variables: Variables) => Result;
};

export interface GraphQLError {
	message: string;
	locations?: { line: number; column: number }[];
	path?: string[];
	extensions?: Record<string, unknown>;
}

export interface GraphQLResponse<T> {
	data?: T;
	errors?: GraphQLError[];
}

// Interfaz para opciones de la petición GraphQL
export interface GraphQLRequestOptions<Variables> {
	query: string | TypedDocumentString<any, Variables>;
	variables?: Variables;
	headers?: HeadersInit;
	cache?: RequestCache;
	requireAuth?: boolean; // Nueva opción para indicar si la petición requiere autenticación
}

// Función que acepta tanto un documento GraphQL directamente como un objeto con una propiedad query
export async function executeGraphQL<Result, Variables>(
	queryOrOptions: string | TypedDocumentString<Result, Variables> | GraphQLRequestOptions<Variables>,
	optionsOrVariables?:
		| {
				variables?: Variables;
				headers?: HeadersInit;
				cache?: RequestCache;
				requireAuth?: boolean;
		  }
		| Variables,
): Promise<Result> {
	// Normalizar los parámetros para manejar ambos estilos de llamada
	let query: string;
	let variables: Variables | undefined;
	let headers: HeadersInit | undefined;
	let cache: RequestCache = "force-cache";
	let requireAuth: boolean = false; // Por defecto, no requerir autenticación

	if (typeof queryOrOptions === "string") {
		// Caso 1: executeGraphQL(query, { variables, headers, cache })
		query = queryOrOptions;
		if (optionsOrVariables) {
			if (typeof optionsOrVariables === "object") {
				if ("variables" in optionsOrVariables) {
					// Es un objeto de opciones
					variables = optionsOrVariables.variables;
					headers = optionsOrVariables.headers;
					if (optionsOrVariables.cache) cache = optionsOrVariables.cache;
					if (optionsOrVariables.requireAuth) requireAuth = optionsOrVariables.requireAuth;
				} else {
					// Es directamente un objeto de variables
					variables = optionsOrVariables as Variables;
				}
			}
		}
	} else if ("query" in queryOrOptions) {
		// Caso 2: executeGraphQL({ query, variables, headers, cache })
		const queryValue = queryOrOptions.query;
		if (typeof queryValue === "string") {
			query = queryValue;
		} else if (queryValue && typeof queryValue === "object") {
			// Si es un objeto con método toString (como los documentos de graphql-tag)
			query = String(queryValue);
		} else {
			query = "";
		}
		variables = queryOrOptions.variables;
		headers = queryOrOptions.headers;
		if (queryOrOptions.cache) cache = queryOrOptions.cache;
		if (queryOrOptions.requireAuth) requireAuth = queryOrOptions.requireAuth;
	} else {
		throw new Error("Invalid queryOrOptions: expected string or object with query property");
	}

	// Verificar que query no sea undefined
	if (!query) {
		console.error("GraphQL query is undefined", {
			queryOrOptions: typeof queryOrOptions === "string" ? "string-document" : "options-object",
			queryValue: query,
			queryType: typeof query,
		});
		throw new Error(
			"GraphQL query is undefined - Comprueba que los documentos GraphQL estén correctamente importados y generados",
		);
	}

	// Usar una URL que funcione tanto en el servidor como en el cliente
	// En el servidor (Node.js), usamos http://api:8000/graphql/
	// En el cliente (navegador), usamos /graphql/ (relativo a la URL actual)
	const apiUrl =
		typeof window === "undefined"
			? "http://api:8000/graphql/" // URL para el servidor (Docker)
			: "/graphql/"; // URL relativa para el cliente (navegador)

	// Obtener el token de autenticación de las variables de entorno
	const authToken = process.env.SALEOR_APP_TOKEN;

	// Preparar las cabeceras con el token de autenticación si está disponible
	const authHeaders: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// Copiar las cabeceras personalizadas si existen
	if (headers) {
		Object.entries(headers).forEach(([key, value]) => {
			if (typeof value === "string") {
				authHeaders[key] = value;
			}
		});
	}

	// Añadir el token de autenticación si está disponible y se requiere autenticación
	if (authToken && (requireAuth || process.env.ALWAYS_AUTH === "true")) {
		authHeaders["Authorization"] = `Bearer ${authToken}`;
		console.log("executeGraphQL: Usando token de autenticación");
	} else if (requireAuth) {
		console.warn(
			"executeGraphQL: Se requiere autenticación pero no se encontró SALEOR_APP_TOKEN en las variables de entorno",
		);
	}

	// Logs de depuración
	console.log("executeGraphQL: Enviando petición a", apiUrl);
	console.log("executeGraphQL: Query:", query.toString());
	console.log("executeGraphQL: Variables:", JSON.stringify(variables));

	// Usar fetch directamente
	const result = await fetch(apiUrl, {
		method: "POST",
		headers: authHeaders,
		body: JSON.stringify({
			query: query.toString(),
			...(variables && { variables }),
		}),
		cache,
	});

	if (!result.ok) {
		console.error("executeGraphQL: Error HTTP", result.status, result.statusText);
		try {
			const errorBody = await result.text();
			console.error("executeGraphQL: Cuerpo de la respuesta de error:", errorBody);
		} catch (e) {
			console.error("executeGraphQL: No se pudo leer el cuerpo de la respuesta de error");
		}
		throw new Error(`HTTP error! Status: ${result.status}`);
	}

	const body = (await result.json()) as GraphQLResponse<Result>;

	console.log("executeGraphQL: Respuesta recibida:", body);

	if (body.errors) {
		console.error("GraphQL errors", body.errors);
		throw new Error(body.errors.map((e) => e.message).join(", "));
	}

	if (!body.data) {
		throw new Error("No data returned from GraphQL query");
	}

	return body.data;
}
