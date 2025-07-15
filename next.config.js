/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url";
import path from "path";
import i18nConfig from "./next-i18next.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	images: {
		domains: ["localhost", "ornitu.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
		],
	},
	experimental: {
		serverComponentsExternalPackages: ["graphql"],
		typedRoutes: false,
	},
	// used in the Dockerfile
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined,
	// Configuración de variables de entorno
	env: {
		// Exponer SALEOR_APP_TOKEN para que esté disponible en el servidor de Next.js
		SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
		// Otras variables de entorno que puedan ser necesarias
		NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://api:8000/graphql/",
	},
};

export default nextConfig;
