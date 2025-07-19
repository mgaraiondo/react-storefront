"use client";

import { SaleorAuthProvider, useAuthChange } from "@saleor/auth-sdk/react";
import { invariant } from "ts-invariant";
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { useState } from "react";
import { Provider as UrqlProvider, cacheExchange, createClient, dedupExchange, fetchExchange } from "urql";

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

export const saleorAuthClient = createSaleorAuthClient({
	saleorApiUrl,
});

const makeUrqlClient = () => {
	return createClient({
		url: saleorApiUrl,
		suspense: true,
		// requestPolicy: "cache-first",
		fetch: (input, init) => saleorAuthClient.fetchWithAuth(input as NodeJS.fetch.RequestInfo, init),
		exchanges: [dedupExchange, cacheExchange, fetchExchange],
	});
};

// Usando una definición simple para evitar problemas con ReactNode
export function AuthProvider(props: { children: any }) {
	invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	const [urqlClient, setUrqlClient] = useState(() => makeUrqlClient());

	useAuthChange({
		saleorApiUrl,
		onSignedOut: () => {
			setUrqlClient(makeUrqlClient());
		},
		onSignedIn: () => {
			setUrqlClient(makeUrqlClient());
		},
	});

	return (
		<SaleorAuthProvider client={saleorAuthClient}>
			<UrqlProvider value={urqlClient}>{props.children}</UrqlProvider>
		</SaleorAuthProvider>
	);
}
