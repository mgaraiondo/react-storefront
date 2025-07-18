// storefront/src/app/[channel]/(main)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { gql } from "graphql-tag";
import { executeGraphQL, type TypedDocumentString } from "@/lib/graphql";

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

// Esquema de validación con Yup
const RegisterSchema = Yup.object().shape({
	email: Yup.string().email("Email ez da baliozkoa").required("Email beharrezkoa da"),
	password: Yup.string()
		.min(8, "Pasahitzak gutxienez 8 karaktere izan behar ditu")
		.required("Pasahitza beharrezkoa da"),
	firstName: Yup.string().required("Izena beharrezkoa da"),
	lastName: Yup.string().required("Abizena beharrezkoa da"),
	companyName: Yup.string().required("Enpresaren izena beharrezkoa da"),
	taxId: Yup.string().required("IFK/NAN beharrezkoa da"),
	phoneNumber: Yup.string().required("Telefono zenbakia beharrezkoa da"),
	streetAddress: Yup.string().required("Helbidea beharrezkoa da"),
	city: Yup.string().required("Herria beharrezkoa da"),
	postalCode: Yup.string().required("Posta kodea beharrezkoa da"),
	country: Yup.string().required("Herrialdea beharrezkoa da"),
	terms: Yup.boolean()
		.oneOf([true], "Baldintzak onartu behar dituzu")
		.required("Baldintzak onartu behar dituzu"),
});

export default function RegisterPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState(null as string | null);

	const initialValues: RegisterFormData = {
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		companyName: "",
		taxId: "",
		phoneNumber: "",
		streetAddress: "",
		city: "",
		postalCode: "",
		country: "",
		terms: false,
	};

	const handleSubmit = async (
		values: RegisterFormData,
		{ setSubmitting }: FormikHelpers<RegisterFormData>,
	) => {
		setError(null);

		try {
			const result = await executeGraphQL(REGISTER_USER, {
				variables: {
					input: {
						email: values.email,
						password: values.password,
						redirectUrl: `${window.location.origin}/account-confirmation`,
						firstName: values.firstName,
						lastName: values.lastName,
						// Estos campos se guardarán como metadatos
						metadata: [
							{ key: "companyName", value: values.companyName },
							{ key: "taxId", value: values.taxId },
							{ key: "phoneNumber", value: values.phoneNumber },
							{ key: "streetAddress", value: values.streetAddress },
							{ key: "city", value: values.city },
							{ key: "postalCode", value: values.postalCode },
							{ key: "country", value: values.country },
						],
					},
				},
				requireAuth: false, // No se requiere autenticación para registrarse
			});

			if (result.accountRegister?.user) {
				setIsSubmitted(true);
			} else if (result.accountRegister?.errors?.length > 0) {
				setError(result.accountRegister.errors[0].message);
			}
		} catch (err) {
			console.error("Error al registrar usuario:", err);
			setError(err instanceof Error ? err.message : "Errore bat gertatu da erregistroan");
		}

		setSubmitting(false);
	};

	if (isSubmitted) {
		return (
			<div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
				<h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Erregistroa burututa</h1>
				<p className="mb-4 text-center text-gray-600">
					Eskerrik asko erregistratzeagatik! Mezu elektroniko bat bidali dizugu zure kontua aktibatzeko.
					Mesedez, egiaztatu zure posta elektronikoa eta jarraitu bertan agertzen diren argibideak.
				</p>
				<div className="mt-6 text-center">
					<Link
						href="/"
						className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Itzuli hasierara
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
			<h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Sortu kontu berria</h1>

			{error && <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">{error}</div>}

			<Formik initialValues={initialValues} validationSchema={RegisterSchema} onSubmit={handleSubmit}>
				{({
					errors,
					touched,
					isSubmitting,
				}: {
					errors: Record<string, string>;
					touched: Record<string, boolean>;
					isSubmitting: boolean;
				}) => (
					<Form className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Email</label>
							<Field
								type="email"
								name="email"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.email && touched.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Pasahitza</label>
							<Field
								type="password"
								name="password"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.password && touched.password && (
								<p className="mt-1 text-sm text-red-600">{errors.password}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Izena</label>
								<Field
									type="text"
									name="firstName"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
								{errors.firstName && touched.firstName && (
									<p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">Abizena</label>
								<Field
									type="text"
									name="lastName"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
								{errors.lastName && touched.lastName && (
									<p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Enpresaren izena</label>
							<Field
								type="text"
								name="companyName"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.companyName && touched.companyName && (
								<p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">IFK/NAN</label>
							<Field
								type="text"
								name="taxId"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.taxId && touched.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Telefono zenbakia</label>
							<Field
								type="tel"
								name="phoneNumber"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.phoneNumber && touched.phoneNumber && (
								<p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Helbidea</label>
							<Field
								type="text"
								name="streetAddress"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
							{errors.streetAddress && touched.streetAddress && (
								<p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Herria</label>
								<Field
									type="text"
									name="city"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
								{errors.city && touched.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">Posta kodea</label>
								<Field
									type="text"
									name="postalCode"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
								{errors.postalCode && touched.postalCode && (
									<p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Herrialdea</label>
							<Field
								as="select"
								name="country"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="">Aukeratu herrialdea</option>
								<option value="ES">Espainia</option>
								<option value="FR">Frantzia</option>
								<option value="PT">Portugal</option>
							</Field>
							{errors.country && touched.country && (
								<p className="mt-1 text-sm text-red-600">{errors.country}</p>
							)}
						</div>

						<div className="flex items-start">
							<div className="flex h-5 items-center">
								<Field
									type="checkbox"
									name="terms"
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</div>
							<div className="ml-3 text-sm">
								<label htmlFor="terms" className="font-medium text-gray-700">
									Onartzen ditut{" "}
									<Link href="/terms" className="text-blue-600 hover:underline">
										erabilera baldintzak
									</Link>
								</label>
								{errors.terms && touched.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full rounded-md bg-[rgb(32,56,134)] px-4 py-2 text-white hover:bg-[rgb(25,45,110)] focus:outline-none focus:ring-2 focus:ring-[rgb(32,56,134)] focus:ring-offset-2 disabled:opacity-50"
							>
								{isSubmitting ? "Prozesatzen..." : "Erregistratu"}
							</button>
						</div>
					</Form>
				)}
			</Formik>

			<div className="mt-4 text-center">
				<p>
					Dagoeneko kontua baduzu?{" "}
					<Link href="/login" className="text-blue-600 hover:underline">
						Hasi saioa
					</Link>
				</p>
			</div>
		</div>
	);
}
