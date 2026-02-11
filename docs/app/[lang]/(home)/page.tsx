import type { Route } from "next";
import Link from "next/link";
import { i18n } from "@/lib/i18n";

const translations = {
  en: {
    description:
      "React wrapper for the GISTDA Sphere Map API with full TypeScript support.",
    disclaimer: (
      <>
        This is an <strong>unofficial</strong> community project and is not
        affiliated with, endorsed by, or supported by GISTDA.
      </>
    ),
    getStarted: "Get Started",
    playground: "Playground",
  },
  th: {
    description:
      "React wrapper สำหรับ GISTDA Sphere Map API พร้อมรองรับ TypeScript อย่างเต็มรูปแบบ",
    disclaimer: (
      <>
        นี่คือโปรเจกต์ชุมชนที่<strong>ไม่เป็นทางการ</strong> และไม่ได้มีส่วนเกี่ยวข้อง
        ได้รับการรับรอง หรือได้รับการสนับสนุนจาก GISTDA
      </>
    ),
    getStarted: "เริ่มต้นใช้งาน",
    playground: "ทดลองเล่น",
  },
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const prefix = lang !== i18n.defaultLanguage ? `/${lang}` : "";
  const t = translations[lang as keyof typeof translations] ?? translations.en;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-4xl tracking-tight">
          gistda-sphere-react
        </h1>
        <p className="text-fd-muted-foreground text-lg">{t.description}</p>
      </div>
      <p className="max-w-lg text-fd-muted-foreground text-sm">
        {t.disclaimer}
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm hover:bg-fd-primary/90"
          href={`${prefix}/docs` as Route}
        >
          {t.getStarted}
        </Link>
        <Link
          className="rounded-lg border border-fd-border px-5 py-2.5 font-medium text-sm hover:bg-fd-accent"
          href={`${prefix}/playground` as Route}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.playground}
        </Link>
      </div>
    </div>
  );
}
