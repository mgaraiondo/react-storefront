/**
 * @type {import('next-i18next').UserConfig}
 */
const i18nConfig = {
	i18n: {
		defaultLocale: "eu",
		locales: ["eu", "es"],
		localeDetection: true,
	},
	localePath: "./public/locales",
	reloadOnPrerender: process.env.NODE_ENV === "development",
};

export default i18nConfig;
