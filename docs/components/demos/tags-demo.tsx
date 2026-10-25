"use client";

import {
  SphereMap,
  TAG_CATEGORIES,
  Tag,
  useTagCategories,
} from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const TEXT = {
  en: {
    active: (count: number) => `${count} on`,
    category: "Category",
    clear: "Clear",
    loading: "Loading categories…",
  },
  th: {
    active: (count: number) => `เปิด ${count}`,
    category: "หมวดหมู่",
    clear: "ล้าง",
    loading: "กำลังโหลดหมวดหมู่…",
  },
};

/** Tag categories loaded live; each selected tag is a `<Tag>` on the map. */
function TagPicker() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { categories, isLoading } = useTagCategories(language);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const list = categories.length > 0 ? categories : TAG_CATEGORIES;
  const category = list[Math.min(categoryIndex, list.length - 1)];

  const toggle = (tag: string) =>
    setActiveTags((previous) =>
      previous.includes(tag)
        ? previous.filter((existing) => existing !== tag)
        : [...previous, tag]
    );

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={12}
      >
        {activeTags.map((tag) => (
          <Tag key={tag} name={tag} />
        ))}
      </SphereMap>
      <DemoBar>
        <label className="flex items-center gap-1 text-fd-muted-foreground text-xs">
          {text.category}
          <select
            className="rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs"
            onChange={(event) => setCategoryIndex(Number(event.target.value))}
            value={categoryIndex}
          >
            {list.map((item, index) => (
              <option key={item.name} value={index}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {isLoading ? <DemoNote>{text.loading}</DemoNote> : null}
        <span className="ml-auto flex items-center gap-2">
          <DemoNote>{text.active(activeTags.length)}</DemoNote>
          <DemoButton
            disabled={activeTags.length === 0}
            onClick={() => setActiveTags([])}
          >
            {text.clear}
          </DemoButton>
        </span>
        <div className="flex w-full flex-wrap gap-1">
          {category?.tags.map((tag) => (
            <DemoButton
              active={activeTags.includes(tag.id)}
              key={tag.id}
              onClick={() => toggle(tag.id)}
            >
              {tag.label}
            </DemoButton>
          ))}
        </div>
      </DemoBar>
    </>
  );
}

export function TagsDemo() {
  return (
    <DemoFrame height="520px">
      <TagPicker />
    </DemoFrame>
  );
}
