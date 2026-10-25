"use client";

import {
  SphereMap,
  TAG_CATEGORIES,
  Tag,
  useTagCategories,
} from "gistda-sphere-react";
import { useState } from "react";

/** Tag categories loaded live. Each chosen tag is a `<Tag>` on the map. */
export function TagPicker() {
  const { categories, isLoading } = useTagCategories();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Use the built-in list until the live one has loaded.
  const list = categories.length > 0 ? categories : TAG_CATEGORIES;
  const category = list[Math.min(categoryIndex, list.length - 1)];

  const toggle = (tag: string) => {
    setActiveTags((previous) =>
      previous.includes(tag)
        ? previous.filter((existing) => existing !== tag)
        : [...previous, tag]
    );
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={12}
      >
        {activeTags.map((tag) => (
          <Tag key={tag} name={tag} />
        ))}
      </SphereMap>
      <div className="controls">
        <label>
          Category
          <select
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
        {isLoading ? <small>Loading categories…</small> : null}
        <output>{activeTags.length} on</output>
        <button
          disabled={activeTags.length === 0}
          onClick={() => setActiveTags([])}
          type="button"
        >
          Clear
        </button>
      </div>
      <div className="controls">
        {category?.tags.map((tag) => (
          <button
            aria-pressed={activeTags.includes(tag.id)}
            key={tag.id}
            onClick={() => toggle(tag.id)}
            type="button"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </>
  );
}
