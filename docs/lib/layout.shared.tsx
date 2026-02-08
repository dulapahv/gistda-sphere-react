import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "gistda-sphere-react",
    },
    links: [
      {
        text: "Docs",
        url: "/docs",
        active: "nested-url",
      },
      {
        text: "Playground",
        url: "/playground",
        external: true,
      },
      {
        text: "GitHub",
        url: "https://github.com/dulapahv/gistda-sphere-react",
        external: true,
      },
    ],
  };
}
