import React from "react";
import Link from "next/link";
import gql from "graphql-tag";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
//import { ChannelSelect } from "./ChannelSelect";
import { executeGraphQL } from "@/lib/graphql";

// Definir tipos para los datos de la consulta
interface MenuItem {
	id: string;
	name: string;
	level: number;
	category?: {
		id: string;
		slug: string;
		name: string;
	};
	collection?: {
		id: string;
		name: string;
		slug: string;
	};
	page?: {
		id: string;
		title: string;
		slug: string;
	};
	url?: string;
	children?: MenuItem[];
}

interface MenuGetBySlugResult {
	menu?: {
		items?: MenuItem[];
	};
}

interface Channel {
	slug: string;
	name: string;
	currencyCode: string;
	id: string; // Añadido campo id requerido
}

interface ChannelsListResult {
	channels?: Channel[];
}

// Definir las consultas directamente usando gql
const MenuGetBySlugDocument = gql`
	fragment MenuItem on MenuItem {
		id
		name
		level
		category {
			id
			slug
			name
		}
		collection {
			id
			name
			slug
		}
		page {
			id
			title
			slug
		}
		url
	}

	query MenuGetBySlug($slug: String!, $channel: String!) {
		menu(slug: $slug, channel: $channel) {
			items {
				...MenuItem
				children {
					...MenuItem
				}
			}
		}
	}
`;

const ChannelsListDocument = gql`
	query ChannelsList {
		channels {
			id
			slug
			name
			currencyCode
		}
	}
`;

export const Footer = async ({ channel }: { channel: string }) => {
	// Asegurarnos de que las consultas se pasan como strings
	const footerQueryString = MenuGetBySlugDocument.loc?.source?.body || MenuGetBySlugDocument.toString();
	const channelsQueryString = ChannelsListDocument.loc?.source?.body || ChannelsListDocument.toString();

	console.log("Footer: Iniciando consultas GraphQL");

	// Validar el canal y usar un valor por defecto seguro si es inválido
	const safeChannel =
		channel && typeof channel === "string" && !channel.includes(".js") ? channel : "default"; // Usar 'default' como valor seguro

	console.log("Footer: Usando canal:", safeChannel);

	try {
		// Ejecutar ambas consultas en paralelo
		// La consulta de canales requiere autenticación, pero ahora executeGraphQL lo maneja automáticamente
		const [footerLinks] = await Promise.all([
			executeGraphQL<MenuGetBySlugResult, { slug: string; channel: string }>({
				query: footerQueryString,
				variables: { slug: "footer", channel: safeChannel },
				cache: "force-cache",
			}),
			executeGraphQL<ChannelsListResult, {}>({
				query: channelsQueryString,
				cache: "force-cache",
				// Añadimos cabecera de autorización manualmente si es necesario
				headers: {
					Authorization: `Bearer ${process.env.SALEOR_APP_TOKEN || ""}`,
				},
			}),
		]);

		const currentYear = new Date().getFullYear();

		return (
			<footer className="border-neutral-300 bg-neutral-50">
				<div className="mx-auto max-w-7xl px-4 lg:px-8">
					<div className="grid grid-cols-3 gap-8 py-16">
						{footerLinks.menu?.items?.map((item: MenuItem) => {
							return (
								<div key={item.id}>
									<h3 className="text-sm font-semibold text-neutral-900">{item.name}</h3>
									<ul className="mt-4 space-y-4 [&>li]:text-neutral-500">
										{item.children?.map((child: MenuItem) => {
											if (child.category) {
												return (
													<li key={child.id} className="text-sm">
														<LinkWithChannel href={`/categories/${child.category.slug}`}>
															{child.category.name}
														</LinkWithChannel>
													</li>
												);
											}
											if (child.collection) {
												return (
													<li key={child.id} className="text-sm">
														<LinkWithChannel href={`/collections/${child.collection.slug}`}>
															{child.collection.name}
														</LinkWithChannel>
													</li>
												);
											}
											if (child.page) {
												return (
													<li key={child.id} className="text-sm">
														<LinkWithChannel href={`/pages/${child.page.slug}`}>
															{child.page.title}
														</LinkWithChannel>
													</li>
												);
											}
											if (child.url) {
												return (
													<li key={child.id} className="text-sm">
														<LinkWithChannel href={child.url}>{child.name}</LinkWithChannel>
													</li>
												);
											}
											return null;
										})}
									</ul>
								</div>
							);
						})}
					</div>

					{/* Componente de cambio de moneda desactivado temporalmente
					{channelsData && channelsData.channels && (
						<div className="mb-4 text-neutral-500">
							<label>
								<span className="text-sm">Change currency:</span>{" "}
								<ChannelSelect channels={channelsData.channels} />
							</label>
						</div>
					)}
					*/}

					<div className="flex flex-col justify-between border-t border-neutral-200 py-10 sm:flex-row">
						<p className="text-sm text-neutral-500">Copyright &copy; {currentYear} Garaiondo Bastida SL</p>
						<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
							<div className="mt-2 flex gap-4 sm:mt-0">
								<Link href={`/${safeChannel}/register`} className="text-sm text-blue-600 hover:text-blue-800">
									Erregistratu
								</Link>
								<Link href={`/${safeChannel}/login`} className="text-sm text-blue-600 hover:text-blue-800">
									Hasi saioa
								</Link>
							</div>
						</div>
					</div>
				</div>
			</footer>
		);
	} catch (error) {
		// Si falla la consulta de canales, mostramos el footer sin el selector de canales
		console.error("Footer: Error al cargar datos:", error);

		// Intentamos obtener al menos los enlaces del footer
		const footerLinks = await executeGraphQL<MenuGetBySlugResult, { slug: string; channel: string }>({
			query: footerQueryString,
			variables: { slug: "footer", channel: safeChannel },
			cache: "force-cache",
		});

		const currentYear = new Date().getFullYear();

		return (
			<footer className="mt-24 border-t border-neutral-200 bg-white px-4 pb-8 pt-6">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row">
					<div className="flex flex-col gap-6 md:flex-row">
						{footerLinks.menu?.items?.map((item) => (
							<div key={item.id} className="min-w-[200px]">
								<h3 className="mb-3 text-sm font-semibold text-neutral-700">{item.name}</h3>
								<div className="flex flex-col gap-2">
									{item.children?.map((child) => {
										if (child.url) {
											return (
												<a
													key={child.id}
													href={child.url}
													target="_blank"
													rel="noreferrer"
													className="text-sm text-neutral-500 hover:text-neutral-700"
												>
													{child.name}
												</a>
											);
										}

										if (child.category) {
											return (
												<Link
													key={child.id}
													href={`/${safeChannel}/categories/${child.category.slug}`}
													className="text-sm text-neutral-500 hover:text-neutral-700"
												>
													{child.name}
												</Link>
											);
										}

										if (child.collection) {
											return (
												<Link
													key={child.id}
													href={`/${safeChannel}/collections/${child.collection.slug}`}
													className="text-sm text-neutral-500 hover:text-neutral-700"
												>
													{child.name}
												</Link>
											);
										}

										if (child.page) {
											return (
												<Link
													key={child.id}
													href={`/${safeChannel}/pages/${child.page.slug}`}
													className="text-sm text-neutral-500 hover:text-neutral-700"
												>
													{child.name}
												</Link>
											);
										}

										return null;
									})}
								</div>
							</div>
						))}
					</div>

					{/* No mostramos el selector de canales en caso de error */}

					<div className="flex flex-1 flex-col gap-2">
						<p className="text-sm text-neutral-500"> {currentYear} Ornitu</p>
						<div className="mt-2 flex gap-4">
							<Link href={`/${safeChannel}/register`} className="text-sm text-blue-600 hover:text-blue-800">
								Erregistratu
							</Link>
							<Link href={`/${safeChannel}/login`} className="text-sm text-blue-600 hover:text-blue-800">
								Hasi saioa
							</Link>
						</div>
					</div>
				</div>
			</footer>
		);
	}
};
