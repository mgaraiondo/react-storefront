import { notFound } from "next/navigation";
import { ProductListPaginatedDocument, type ProductListPaginatedQuery, type Exact } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";

export const metadata = {
	title: "Products · Saleor Storefront example",
	description: "All products in Saleor Storefront example",
};

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor: string | string[] | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;

	const data = await executeGraphQL<
		ProductListPaginatedQuery,
		Exact<{ first: number; after: string | null; channel: string }>
	>({
		query: ProductListPaginatedDocument.toString(),
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel: params.channel,
		},
		cache: "force-cache",
	});

	if (!data.products) {
		notFound();
	}

	// Ahora sabemos que data.products no es null
	const products = data.products;

	const newSearchParams = new URLSearchParams({
		...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
	});

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products.edges.map((e) => e.node)} />
			<Pagination
				pageInfo={{
					...products.pageInfo,
					basePathname: `/products`,
					urlSearchParams: newSearchParams,
				}}
			/>
		</section>
	);
}
