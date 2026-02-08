import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-4xl tracking-tight">
          gistda-sphere-react
        </h1>
        <p className="text-fd-muted-foreground text-lg">
          React wrapper for the GISTDA Sphere Map API with full TypeScript
          support.
        </p>
      </div>
      <p className="max-w-lg text-fd-muted-foreground text-sm">
        This is an <strong>unofficial</strong> community project and is not
        affiliated with, endorsed by, or supported by GISTDA.
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm hover:bg-fd-primary/90"
          href="/docs"
        >
          Get Started
        </Link>
        <Link
          className="rounded-lg border border-fd-border px-5 py-2.5 font-medium text-sm hover:bg-fd-accent"
          href="/playground"
          rel="noopener noreferrer"
          target="_blank"
        >
          Playground
        </Link>
      </div>
    </div>
  );
}
