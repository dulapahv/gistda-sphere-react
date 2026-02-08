"use client";

import { TAG_CATEGORIES, useTags } from "gistda-sphere-react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import "./TagsPanel.css";

/** POI tag toggle panel with category grouping and popup control. */
export function TagsPanel() {
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
    <div className="pg-panel-section">
      <div className="pg-section-header">POI Tags</div>
      <p className="pg-tool-hint">Toggle tags to show points of interest</p>

      {TAG_CATEGORIES.map((category) => (
        <div className="pg-tag-category" key={category.name}>
          <div className="pg-category-name">{category.name}</div>
          <div className="pg-tag-grid">
            {category.tags.map((tag) => (
              <button
                className={`pg-tag-btn ${activeTags.has(tag.id) ? "active" : ""}`}
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

      <div className="pg-tags-footer">
        <span className="pg-tags-count">{activeTags.size} active</span>
        <div className="pg-button-row">
          <button
            className={`pg-btn pg-btn-sm ${popupEnabled ? "pg-btn-primary" : ""}`}
            onClick={handleTogglePopup}
            type="button"
          >
            {popupEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            className="pg-btn pg-btn-sm"
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
