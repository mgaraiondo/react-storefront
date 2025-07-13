// storefront/src/app/[channel]/(main)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { gql } from "graphql-tag";
import { executeGraphQL } from "@/lib/graphql";
import type { TypedDocumentString } from "@/gql/graphql";

// Definimos los tipos para la respuesta de la mutación
interface AccountRegisterResponse {
	accountRegister: {
		user: {
			id: string;
			email: string;
			isActive: boolean;
		} | null;
		errors: Array<{
			field: string;
			message: string;
		}>;
	};
}

// Definimos la mutación para registrar un usuario
const REGISTER_USER_QUERY = gql`
	mutation AccountRegister($input: AccountRegisterInput!) {
		accountRegister(input: $input) {
			user {
				id
				email
				isActive
			}
			errors {
				field
				message
			}
		}
	}
`;

// Convertimos la mutación a TypedDocumentString para que sea compatible con executeGraphQL
const REGISTER_USER = REGISTER_USER_QUERY as unknown as TypedDocumentString<
	AccountRegisterResponse,
	{
		input: {
			email: string;
			password: string;
			redirectUrl: string;
			firstName: string;
			lastName: string;
			metadata: { key: string; value: string }[];
		};
	}
>;

// Definimos los tipos para el formulario
interface RegisterFormData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	companyName: string;
	taxId: string;
	phoneNumber: string;
	streetAddress: string;
	city: string;
	postalCode: string;
	country: string;
	terms: boolean;
}

export default function RegisterPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>();

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await executeGraphQL(REGISTER_USER, {
				variables: {
					input: {
						email: data.email,
						password: data.password,
						redirectUrl: `${window.location.origin}/account-confirmation`,
						firstName: data.firstName,
						lastName: data.lastName,
						// Estos campos se guardarán como metadatos
						metadata: [
							{ key: "companyName", value: data.companyName },
							{ key: "taxId", value: data.taxId },
							{ key: "phoneNumber", value: data.phoneNumber },
							{ key: "streetAddress", value: data.streetAddress },
							{ key: "city", value: data.city },
							{ key: "postalCode", value: data.postalCode },
							{ key: "country", value: data.country },
						],
					},
				},
			});

			if (result.accountRegister?.user) {
				setIsSubmitted(true);
			} else if (result.accountRegister?.errors?.length > 0) {
				setError(result.accountRegister.errors[0].message);
			}
		} catch (err) {
			console.error("Error al registrar usuario:", err);
			setError("Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
				<h2 className="mb-4 text-center text-2xl font-bold text-green-600">Eskaera jasota!</h2>
				<p className="mb-4 text-center">
					Zure erregistro eskaera jaso dugu. Gure taldeak berrikusi ondoren, mezu elektroniko bat jasoko duzu.
				</p>
				<div className="text-center">
					<Link href="/" className="text-blue-600 hover:underline">
						Hasierako orrira itzuli
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
			<h2 className="mb-6 text-center text-2xl font-bold">Bezero berria erregistratu</h2>

			{error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						{...register("email", { required: "Email beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Pasahitza</label>
					<input
						type="password"
						{...register("password", {
							required: "Pasahitza beharrezkoa da",
							minLength: { value: 8, message: "Pasahitzak gutxienez 8 karaktere izan behar ditu" },
						})}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Izena</label>
						<input
							type="text"
							{...register("firstName", { required: "Izena beharrezkoa da" })}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
						{errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Abizena</label>
						<input
							type="text"
							{...register("lastName", { required: "Abizena beharrezkoa da" })}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
						{errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Enpresaren izena</label>
					<input
						type="text"
						{...register("companyName", { required: "Enpresaren izena beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">IFK/NAN</label>
					<input
						type="text"
						{...register("taxId", { required: "IFK/NAN beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Telefono zenbakia</label>
					<input
						type="tel"
						{...register("phoneNumber", { required: "Telefono zenbakia beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Helbidea</label>
					<input
						type="text"
						{...register("streetAddress", { required: "Helbidea beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					{errors.streetAddress && (
						<p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Hiria</label>
						<input
							type="text"
							{...register("city", { required: "Hiria beharrezkoa da" })}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
						{errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Posta kodea</label>
						<input
							type="text"
							{...register("postalCode", { required: "Posta kodea beharrezkoa da" })}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
						{errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Herrialdea</label>
					<select
						{...register("country", { required: "Herrialdea beharrezkoa da" })}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					>
						<option value="">Aukeratu herrialdea</option>
						<option value="ES">España</option>
						<option value="FR">Francia</option>
						<option value="PT">Portugal</option>
					</select>
					{errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
				</div>

				<div className="flex items-center">
					<input
						id="terms"
						type="checkbox"
						{...register("terms", { required: "Baldintzen onarpena beharrezkoa da" })}
						className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
						Pribatutasun politika eta erabilera baldintzak onartzen ditut
					</label>
				</div>
				{errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}

				<div>
					<button
						type="submit"
						disabled={isLoading}
						className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						{isLoading ? "Bidaltzen..." : "Erregistratu"}
					</button>
				</div>
			</form>

			<div className="mt-4 text-center">
				<p className="text-sm text-gray-600">
					Dagoeneko kontua duzu?{" "}
					<Link href="/login" className="text-blue-600 hover:underline">
						Hasi saioa
					</Link>
				</p>
			</div>
		</div>
	);
}
