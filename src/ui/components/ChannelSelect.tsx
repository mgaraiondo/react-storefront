"use client";

export const ChannelSelect = ({
	channels,
}: {
	channels: { id: string; name: string; slug: string; currencyCode: string }[];
}) => {
	// Usar una solución sin hooks de navegación
	const currentChannel = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "" : "";

	const handleChannelChange = (newChannel: string) => {
		if (typeof window !== "undefined") {
			window.location.href = `/${newChannel}`;
		}
	};

	return (
		<select
			className="h-10 w-fit rounded-md border border-neutral-300 bg-transparent bg-white px-4 py-2 pr-10 text-sm  placeholder:text-neutral-500 focus:border-black focus:ring-black"
			onChange={(e) => {
				const newChannel = e.currentTarget.value;
				handleChannelChange(newChannel);
			}}
			value={currentChannel}
		>
			{channels.map((channel) => (
				<option key={channel.id} value={channel.slug}>
					{channel.currencyCode}
				</option>
			))}
		</select>
	);
};
