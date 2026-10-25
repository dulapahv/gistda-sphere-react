"use client";

import { SphereMap, useUi } from "gistda-sphere-react";
import { useEffect, useState } from "react";

const SETTINGS = [
  { key: "drag", label: "Drag" },
  { key: "wheel", label: "Wheel zoom" },
  { key: "keyboard", label: "Keyboard" },
  { key: "dpad", label: "D-pad" },
  { key: "scale", label: "Scale bar" },
  { key: "address", label: "Menu: address" },
  { key: "nearby", label: "Menu: nearby" },
  { key: "locked", label: "Lock overlay" },
] as const;

type Setting = (typeof SETTINGS)[number]["key"];

/** Turns map input, built-in controls and the lock overlay on and off with `useUi`. */
export function UiToggles() {
  const ui = useUi();
  const [settings, setSettings] = useState<Record<Setting, boolean>>({
    address: true,
    dpad: true,
    drag: true,
    keyboard: true,
    locked: false,
    nearby: true,
    scale: true,
    wheel: true,
  });

  useEffect(() => {
    if (!ui.isReady) {
      return;
    }
    ui.setMouseEnabled({ drag: settings.drag, wheel: settings.wheel });
    ui.setKeyboardEnabled(settings.keyboard);
    ui.setControlVisible("DPad", settings.dpad);
    ui.setControlVisible("Scale", settings.scale);
    ui.setContextMenuOptions({
      address: settings.address,
      nearPoi: settings.nearby,
    });
  }, [ui, settings]);

  useEffect(() => {
    if (!(ui.isReady && settings.locked)) {
      return;
    }
    const lock = ui.lockMap();
    return () => lock?.remove();
  }, [ui, settings.locked]);

  const toggle = (key: Setting) => {
    setSettings((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={11}
      />
      <div className="controls">
        {SETTINGS.map(({ key, label }) => (
          <button
            aria-pressed={settings[key]}
            key={key}
            onClick={() => toggle(key)}
            type="button"
          >
            {label}
          </button>
        ))}
        <small>Right-click the map to open its menu.</small>
      </div>
    </>
  );
}
