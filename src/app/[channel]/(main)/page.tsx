import {
	ProductListByCollectionDocument,
	type ProductListByCollectionQuery,
	type Exact,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";

export const metadata = {
	title: "ACME Storefront, powered by Saleor & Next.js",
	description:
		"Storefront Next.js Example for building performant e-commerce experiences with Saleor - the composable, headless commerce platform for global brands.",
};

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const params = await props.params;

	// Validar el canal y usar un valor por defecto seguro si es inválido
	const safeChannel =
		params.channel && typeof params.channel === "string" && !params.channel.includes(".js")
			? params.channel
			: "default"; // Usar 'default' como valor seguro

	console.log("Page: Usando canal:", safeChannel);

	const data = await executeGraphQL<ProductListByCollectionQuery, Exact<{ slug: string; channel: string }>>({
		query: ProductListByCollectionDocument.toString(),
		variables: {
			slug: "featured-products",
			channel: safeChannel,
		},
		cache: "force-cache",
	});

	if (!data.collection?.products) {
		return null;
	}

	const products = data.collection?.products.edges.map(({ node: product }) => product);

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products} />
		</section>
	);
}
