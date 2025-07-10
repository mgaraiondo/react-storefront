import { invariant } from "ts-invariant";
import { type TypedDocumentString } from "../gql/graphql";

type GraphQLErrorResponse = {
	errors: readonly {
		message: string;
	}[];
};

type GraphQLRespone<T> = { data: T } | GraphQLErrorResponse;

export async function executeGraphQL<Result, Variables>(
    operation: TypedDocumentString<Result, Variables>,
    options: {
        headers?: HeadersInit;
        cache?: RequestCache;
        revalidate?: number;
        withAuth?: boolean;
    } & (Variables extends Record<string, never> ? { variables?: never } : { variables: Variables }),
): Promise<Result> {
    invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");
    const { variables, headers, cache, revalidate } = options;

    const input = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({
            query: operation.toString(),
            ...(variables && { variables }),
        }),
        cache: cache,
        next: { revalidate },
    };

    // Solución para manejar diferentes entornos (servidor vs cliente)
    let response;
    
    // Verificar si estamos en el navegador o en el servidor
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
        console.log("SSR: Usando estrategia robusta para ISR/SSR");
        
        // En SSR, intentamos con una estrategia específica para ISR
        try {
            // 1. Intentar con la URL específica para SSR
            const ssrApiUrl = 'http://api:8000/graphql/';
            console.log(`Intentando con URL específica para SSR: ${ssrApiUrl}`);
            
            // Configuración especial para fetch en SSR
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
            
            response = await fetch(ssrApiUrl, {
                ...input,
                signal: controller.signal,
                headers: {
                    ...input.headers,
                    'Connection': 'keep-alive',
                    'User-Agent': 'NextJS-SSR-Fetch'
                }
            });
            
            clearTimeout(timeoutId);
            console.log("Conexión SSR exitosa");
        } catch (error) {
            console.error("Error en fetch SSR:", error);
            
            // Si falla, devolvemos un objeto vacío para permitir que ISR continúe
            // En producción, esto permitirá que el cliente rehidrate con datos reales
            console.log("Devolviendo datos vacíos para permitir ISR");
            return {} as any;
        }
    } else {
        console.log("CSR: intentando fetch a", process.env.NEXT_PUBLIC_SALEOR_API_URL);
		console.log("CLIENT: intentando fetch a", process.env.NEXT_PUBLIC_SALEOR_API_URL);

		// En el cliente (navegador), usamos la URL relativa o la URL pública
        // que debería ser accesible desde el navegador
        response = await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL, input);
    }

    if (!response.ok) {
		const body = await (async () => {
			try {
				return await response.text();
			} catch {
				return "";
			}
		})();
		console.error(input.body);
		throw new HTTPError(response, body);
	}

	const body = (await response.json()) as GraphQLRespone<Result>;

	if ("errors" in body) {
		throw new GraphQLError(body);
	}

	return body.data;
}

class GraphQLError extends Error {
	constructor(public errorResponse: GraphQLErrorResponse) {
		const message = errorResponse.errors.map((error) => error.message).join("\n");
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
class HTTPError extends Error {
	constructor(response: Response, body: string) {
		const message = `HTTP error ${response.status}: ${response.statusText}\n${body}`;
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
