import { RootProvider } from "fumadocs-ui/provider/next";
import { i18n } from "@/lib/i18n";

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;

  return (
    <RootProvider
      i18n={{
        // Without these, the language switcher assumes every URL starts with
        // a locale and turns /docs/… into /th/… (English URLs have no /en).
        defaultLanguage: i18n.defaultLanguage,
        hideLocale: i18n.hideLocale,
        locale: lang,
        locales: i18n.languages.map((locale) => ({
          locale,
          name: locale === "th" ? "ไทย" : "English",
        })),
      }}
    >
      {children}
    </RootProvider>
  );
}
