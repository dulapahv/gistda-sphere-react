import { StandalonePlayground } from "@/components/playground/playground";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <StandalonePlayground lang={lang} />;
}
