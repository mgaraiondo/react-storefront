import { ProductListPaginatedDocument, type ProductListPaginatedQuery, type Exact } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";

export const metadata = {
	title: "Products · Saleor Storefront example",
	description: "All products in Saleor Storefront example",
};

// Componente para mostrar cuando no hay productos o hay un error
function ProductNotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<h2 className="mb-4 text-2xl font-bold">Ez dago produkturik eskuragarri</h2>
			<p className="text-gray-600">Saiatu berriro geroago edo bilatu beste produktu batzuk.</p>
		</div>
	);
}

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor: string | string[] | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const params = await props.params;

	// Validar el canal y usar un valor por defecto seguro si es inválido
	const safeChannel =
		params.channel && typeof params.channel === "string" && !params.channel.includes(".js")
			? params.channel
			: "default-channel"; // Usar "default-channel" como valor seguro

	console.log("Products Page: Usando canal:", safeChannel);

	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;

	try {
		const data = await executeGraphQL<
			ProductListPaginatedQuery,
			Exact<{ first: number; after: string | null; channel: string }>
		>({
			query: ProductListPaginatedDocument.toString(),
			variables: {
				first: ProductsPerPage,
				after: cursor,
				channel: safeChannel,
			},
			cache: "force-cache",
		});

		// Si no hay productos, retornar el componente de error
		if (!data.products) {
			return <ProductNotFound />;
		}

		// Ahora sabemos que data.products no es null
		const products = data.products;

		// Verificar que products.pageInfo y products.edges existen antes de usarlos
		if (!products.pageInfo || !products.edges) {
			return <ProductNotFound />;
		}

		const newSearchParams = new URLSearchParams(
			// Usar operador opcional para evitar errores si endCursor es undefined
			products.pageInfo.endCursor ? { cursor: products.pageInfo.endCursor } : {},
		);

		return (
			<section className="mx-auto max-w-7xl p-8 pb-16">
				<h2 className="sr-only">Product list</h2>
				{/* Verificar que products.edges existe y tiene elementos antes de hacer map */}
				{products.edges && products.edges.length > 0 ? (
					<ProductList products={products.edges.map((e) => e.node)} />
				) : (
					<p>Ez dago produkturik eskuragarri.</p>
				)}
				<Pagination
					pageInfo={{
						...products.pageInfo,
						basePathname: `/products`,
						urlSearchParams: newSearchParams,
					}}
				/>
			</section>
		);
	} catch (error) {
		console.error("Error al cargar productos:", error);
		return <ProductNotFound />;
	}
}
