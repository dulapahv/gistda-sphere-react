import { RootProvider } from "fumadocs-ui/provider/next";
import { i18n } from "@/lib/i18n";

/** Locale-aware layout that wraps pages with RootProvider. */
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
