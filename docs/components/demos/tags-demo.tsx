"use client";

import {
  SphereMap,
  SphereProvider,
  TAG_CATEGORIES,
  useTags,
} from "gistda-sphere-react";
import { useState } from "react";
import { useDocLanguage } from "./use-doc-language";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

function TagsControls() {
  const { add, remove, clear, isReady } = useTags();
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const language = useDocLanguage();

  const handleToggle = (tagId: string) => {
    const next = new Set(activeTags);
    if (next.has(tagId)) {
      next.delete(tagId);
      remove(tagId);
    } else {
      next.add(tagId);
      add(tagId);
    }
    setActiveTags(next);
  };

  const handleClear = () => {
    clear();
    setActiveTags(new Set());
  };

  return (
    <>
      <SphereMap
        center={{ lon: 100.5018, lat: 13.7563 }}
        language={language}
        style={{ width: "100%", height: "400px" }}
        zoom={10}
      />
      <div className="flex flex-col gap-2 bg-fd-card p-3">
        {TAG_CATEGORIES.map((category) => (
          <div className="mb-2" key={category.name}>
            <div className="mb-1 text-fd-muted-foreground text-xs">
              {category.name}
            </div>
            <div className="flex flex-wrap gap-1">
              {category.tags.map((tag) => (
                <button
                  className={`cursor-pointer rounded-md border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${activeTags.has(tag.id) ? "border-fd-primary bg-fd-primary text-fd-primary-foreground" : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"}`}
                  disabled={!isReady}
                  key={tag.id}
                  onClick={() => handleToggle(tag.id)}
                  type="button"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-fd-border border-t pt-2">
          <span className="text-fd-muted-foreground text-xs">
            {activeTags.size} active
          </span>
          <button
            className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClear}
            type="button"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}

export function TagsDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <TagsControls />
      </SphereProvider>
    </div>
  );
}
