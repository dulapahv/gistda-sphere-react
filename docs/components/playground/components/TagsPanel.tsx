"use client";

import { TAG_CATEGORIES, useTags } from "gistda-sphere-react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { getTranslations } from "../translations";

interface TagsPanelProps {
  lang: string;
}

export function TagsPanel({ lang }: TagsPanelProps) {
  const t = getTranslations(lang);
  const { add, remove, clear, enablePopup, isReady } = useTags();

  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [popupEnabled, setPopupEnabled] = useState(true);

  const handleToggleTag = (tagId: string) => {
    const newTags = new Set(activeTags);
    if (newTags.has(tagId)) {
      newTags.delete(tagId);
      remove(tagId);
    } else {
      newTags.add(tagId);
      add(tagId);
    }
    setActiveTags(newTags);
  };

  const handleClear = () => {
    clear();
    setActiveTags(new Set());
  };

  const handleTogglePopup = () => {
    const newState = !popupEnabled;
    setPopupEnabled(newState);
    enablePopup(newState);
  };

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.poiTags}
      </div>
      <p className="mt-2 text-fd-secondary-foreground text-xs">
        {t.toggleTagsHint}
      </p>

      {TAG_CATEGORIES.map((category) => (
        <div className="mb-3" key={category.name}>
          <div className="mb-1.5 font-semibold text-[11px] text-fd-secondary-foreground">
            {category.name}
          </div>
          <div className="flex flex-wrap gap-1">
            {category.tags.map((tag) => (
              <button
                className={`cursor-pointer rounded border px-2 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-40 ${
                  activeTags.has(tag.id)
                    ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                    : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:text-fd-foreground"
                }`}
                disabled={!isReady}
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                type="button"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-3 flex items-center justify-between border-fd-border border-t pt-3">
        <span className="text-[11px] text-fd-muted-foreground">
          {t.active(activeTags.size)}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 font-medium text-xs ${
              popupEnabled
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground hover:border-white hover:bg-white"
                : "border-fd-border bg-fd-secondary text-fd-foreground hover:border-fd-ring hover:bg-fd-accent"
            }`}
            onClick={handleTogglePopup}
            type="button"
          >
            {popupEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-foreground text-xs hover:border-fd-ring hover:bg-fd-accent"
            onClick={handleClear}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
