import React from "react";
import gql from "graphql-tag";
import { NavLink } from "./NavLink";
import { executeGraphQL } from "@/lib/graphql";
// Eliminamos la importación no utilizada
// import { Exact } from "@/gql/graphql";

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
		slug: string;
	};
	url?: string;
}

interface MenuGetBySlugResult {
	menu?: {
		items: Array<{
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
				slug: string;
			};
			url?: string;
			children: MenuItem[];
		}>;
	};
}

// Definir el documento GraphQL directamente como constante
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
			slug
			name
		}
		page {
			id
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

export const NavLinks = async ({ channel }: { channel: string }) => {
	// Asegurarnos de que las consultas se pasan como strings
	const menuQueryString = MenuGetBySlugDocument.loc?.source?.body || MenuGetBySlugDocument.toString();

	console.log("NavLinks: Iniciando consulta GraphQL");

	// Validar el canal y usar un valor por defecto seguro si es inválido
	const safeChannel =
		channel && typeof channel === "string" && !channel.includes(".js") ? channel : "default"; // Usar 'default' como valor seguro

	console.log("NavLinks: Usando canal:", safeChannel);

	try {
		// Ejecutar la consulta con la nueva funcionalidad de autenticación automática
		const data = await executeGraphQL<MenuGetBySlugResult, { slug: string; channel: string }>({
			query: menuQueryString,
			variables: { slug: "navbar", channel: safeChannel },
			cache: "force-cache",
		});

		console.log("NavLinks: Datos recibidos:", data);

		if (!data.menu?.items) {
			console.log("NavLinks: No se encontraron elementos de menú");
			return null;
		}

		return (
			<nav className="flex gap-4">
				<NavLink href="/products">All</NavLink>
				{data.menu?.items.map((item) => {
					if (item.category) {
						return (
							<React.Fragment key={item.id}>
								<NavLink href={`/categories/${item.category.slug}`}>{item.name}</NavLink>
							</React.Fragment>
						);
					}
					if (item.collection) {
						return (
							<React.Fragment key={item.id}>
								<NavLink href={`/collections/${item.collection.slug}`}>{item.name}</NavLink>
							</React.Fragment>
						);
					}
					if (item.url) {
						return (
							<React.Fragment key={item.id}>
								<NavLink href={item.url}>{item.name}</NavLink>
							</React.Fragment>
						);
					}
					if (item.page) {
						return (
							<React.Fragment key={item.id}>
								<NavLink href={`/pages/${item.page.slug}`}>{item.name}</NavLink>
							</React.Fragment>
						);
					}
					return null;
				})}
			</nav>
		);
	} catch (error) {
		console.error("NavLinks: Error al cargar datos:", error);
		return (
			<div className="flex h-full flex-row items-center justify-center gap-4">
				<p className="text-sm text-neutral-500">Error al cargar el menú</p>
			</div>
		);
	}
};
