"use client";

import { LinkWithChannel } from "../atoms/LinkWithChannel";

const companyName = "ACME";

export const Logo = () => {
	const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

	if (pathname === "/") {
		return (
			<h1 className="flex items-center font-bold" aria-label="homepage">
				{companyName}
			</h1>
		);
	}
	return (
		<div className="flex items-center font-bold">
			<LinkWithChannel aria-label="homepage" href="/">
				{companyName}
			</LinkWithChannel>
		</div>
	);
};
