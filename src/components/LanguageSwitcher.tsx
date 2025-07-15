"use client";

import { useState, useEffect, useRef } from "react";

export function LanguageSwitcher() {
	// En lugar de usar el router, detectamos el idioma basándonos en la URL actual
	const [currentLocale, setCurrentLocale] = useState("eu");
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		// Detectar el idioma basado en la URL actual del navegador
		const path = window.location.pathname;
		const locale = path.startsWith("/es") ? "es" : "eu";
		setCurrentLocale(locale);
	}, []);

	useEffect(() => {
		function handleClickOutside(event: Event) {
			const target = event.target as Node;
			if (dropdownRef.current && !dropdownRef.current.contains(target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return function cleanup() {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function changeLanguage(locale: string) {
		// Obtener la ruta actual
		let path = window.location.pathname;

		// Modificar la ruta según el idioma seleccionado
		if (locale === "es" && !path.startsWith("/es")) {
			path = `/es${path}`;
		} else if (locale === "eu" && path.startsWith("/es")) {
			path = path.substring(3);
		}

		// Navegar a la nueva ruta
		window.location.href = path;
		setIsOpen(false);
	}

	function getCurrentLanguageName() {
		return currentLocale === "eu" ? "Euskara" : "Español";
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				<span>{getCurrentLanguageName()}</span>
				<span className="ml-2">▼</span>
			</button>

			{isOpen && (
				<div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
					<div className="py-1">
						<button
							className={`block w-full px-4 py-2 text-left text-sm ${
								currentLocale === "eu" ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
							}`}
							onClick={() => changeLanguage("eu")}
							type="button"
						>
							Euskara
						</button>
						<button
							className={`block w-full px-4 py-2 text-left text-sm ${
								currentLocale === "es" ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
							}`}
							onClick={() => changeLanguage("es")}
							type="button"
						>
							Español
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
