import { executeGraphQL } from "@/lib/graphql";
import { ChannelsListDocument, type ChannelsListQuery, type Exact } from "@/gql/graphql";

export const generateStaticParams = async () => {
	// the `channels` query is protected
	// you can either hardcode the channels or use an app token to fetch the channel list here

	if (process.env.SALEOR_APP_TOKEN) {
		// Asegurarnos de que la query se pasa como string o como objeto con propiedad query
		const channelsQueryString = ChannelsListDocument.toString();
		console.log("Token usado:", process.env.SALEOR_APP_TOKEN);

		// Usar requireAuth: true para asegurar que se incluya el token automáticamente
		const channels = await executeGraphQL<ChannelsListQuery, Exact<{ [key: string]: never }>>({
			query: channelsQueryString,
			requireAuth: true, // Cambiar a true para asegurar que se use el token
		});

		return (
			channels.channels
				?.filter((channel) => channel.isActive)
				.map((channel) => ({ channel: channel.slug })) ?? []
		);
	} else {
		console.warn("No se encontró SALEOR_APP_TOKEN en las variables de entorno");
		return [{ channel: "default-channel" }];
	}
};

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
	return children;
}
