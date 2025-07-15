import React from "react";
import gql from "graphql-tag";
import { UserMenu } from "./UserMenu";
import { executeGraphQL } from "@/lib/graphql";
import { type UserDetailsFragment } from "@/gql/graphql";

interface CurrentUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: {
		url: string;
		alt: string;
	};
}

interface CurrentUserResult {
	me: CurrentUser | null;
}

// Definir el documento GraphQL directamente como constante
const CurrentUserDocument = gql`
	query CurrentUser {
		me {
			id
			email
			firstName
			lastName
			avatar {
				url
				alt
			}
		}
	}
`;

export const UserMenuContainer = async () => {
	// Asegurarnos de que las consultas se pasan como strings
	const userDataQueryString = CurrentUserDocument.loc?.source?.body || CurrentUserDocument.toString();

	console.log("UserMenuContainer: Iniciando consulta GraphQL");

	try {
		// Ejecutar la consulta con la nueva funcionalidad de autenticación automática
		// Esta consulta requiere autenticación, por lo que añadimos el token manualmente
		const userData = await executeGraphQL<CurrentUserResult, {}>({
			query: userDataQueryString,
			cache: "no-store", // No almacenar en caché los datos del usuario
			headers: {
				Authorization: `Bearer ${process.env.SALEOR_APP_TOKEN || ""}`,
			},
		});

		console.log("UserMenuContainer: Datos recibidos");

		const user = userData.me;

		if (!user) {
			console.log("UserMenuContainer: Usuario no autenticado");
			// Si no hay usuario, no renderizamos el menú de usuario
			return null;
		}

		// Convertir el usuario de CurrentUser a UserDetailsFragment
		const userDetails: UserDetailsFragment = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatar: user.avatar,
		};

		return <UserMenu user={userDetails} />;
	} catch (error) {
		console.error("UserMenuContainer: Error al cargar datos del usuario:", error);
		// En caso de error, no mostramos el menú de usuario
		return null;
	}
};
