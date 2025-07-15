// Declaraciones de tipos para módulos que no tienen tipos
declare module "graphql-tag" {
	export default function gql(source: string | readonly string[]): any;
	export function gql(source: string | readonly string[]): any;
}

declare module "next/link";
declare module "next/image";
declare module "lucide-react";
declare module "react/jsx-runtime";
declare module "react";

// Definiciones de tipos para el proyecto

// Tipos para elementos DOM
interface HTMLElementWithRef {
	contains(node: Node | null): boolean;
}

// Extender el tipo de useRef para evitar errores de 'any'
declare module "react" {
	interface RefObject<T> {
		readonly current: T | null;
	}
}

// Tipos para GraphQL
// ya declarado arriba

// Tipos para el router de Next.js
declare module "next/navigation" {
	export interface AppRouterInstance {
		push(href: string): void;
	}
}

// Asegurar que process.env esté disponible
declare namespace NodeJS {
	interface ProcessEnv {
		SALEOR_APP_TOKEN?: string;
		[key: string]: string | undefined;
	}
}

// Asegurar que JSX esté disponible
declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}
}

// Declarar process global
declare const process: {
	env: {
		SALEOR_APP_TOKEN?: string;
		[key: string]: string | undefined;
	};
};
