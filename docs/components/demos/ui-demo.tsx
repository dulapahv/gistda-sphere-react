"use client";

import { type MapLockController, SphereMap, useUi } from "gistda-sphere-react";
import { useEffect, useRef, useState } from "react";
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
    dpad: "D-pad",
    drag: "Drag",
    hint: "Right-click the map to open its menu.",
    keyboard: "Keyboard",
    lock: "Lock overlay",
    menuAddress: "Menu: address",
    menuNearby: "Menu: nearby",
    scale: "Scale bar",
    wheel: "Wheel zoom",
  },
  th: {
    dpad: "ปุ่มทิศทาง",
    drag: "ลาก",
    hint: "คลิกขวาที่แผนที่เพื่อเปิดเมนู",
    keyboard: "คีย์บอร์ด",
    lock: "แผ่นล็อก",
    menuAddress: "เมนู: ที่อยู่",
    menuNearby: "เมนู: ใกล้เคียง",
    scale: "มาตราส่วน",
    wheel: "ซูมด้วยล้อเมาส์",
  },
};

/** Toggles input, controls and the lock overlay with `useUi`. */
function UiControls() {
  const text = useDemoText(TEXT);
  const ui = useUi();
  const lockRef = useRef<MapLockController | null>(null);
  const [state, setState] = useState({
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
    ui.setMouseEnabled({ drag: state.drag, wheel: state.wheel });
    ui.setKeyboardEnabled(state.keyboard);
    ui.setControlVisible("DPad", state.dpad);
    ui.setControlVisible("Scale", state.scale);
    ui.setContextMenuOptions({ address: state.address, nearPoi: state.nearby });
  }, [ui, state]);

  useEffect(() => {
    if (!(ui.isReady && state.locked)) {
      return;
    }
    lockRef.current = ui.lockMap();
    return () => {
      lockRef.current?.remove();
      lockRef.current = null;
    };
  }, [ui, state.locked]);

  const toggle = (key: keyof typeof state) =>
    setState((previous) => ({ ...previous, [key]: !previous[key] }));

  return (
    <DemoBar>
      <DemoButton active={state.drag} onClick={() => toggle("drag")}>
        {text.drag}
      </DemoButton>
      <DemoButton active={state.wheel} onClick={() => toggle("wheel")}>
        {text.wheel}
      </DemoButton>
      <DemoButton active={state.keyboard} onClick={() => toggle("keyboard")}>
        {text.keyboard}
      </DemoButton>
      <DemoButton active={state.dpad} onClick={() => toggle("dpad")}>
        {text.dpad}
      </DemoButton>
      <DemoButton active={state.scale} onClick={() => toggle("scale")}>
        {text.scale}
      </DemoButton>
      <DemoButton active={state.address} onClick={() => toggle("address")}>
        {text.menuAddress}
      </DemoButton>
      <DemoButton active={state.nearby} onClick={() => toggle("nearby")}>
        {text.menuNearby}
      </DemoButton>
      <DemoButton active={state.locked} onClick={() => toggle("locked")}>
        {text.lock}
      </DemoButton>
      <DemoNote>{text.hint}</DemoNote>
    </DemoBar>
  );
}

export function UiDemo() {
  const language = useDocLanguage();
  return (
    <DemoFrame height="460px">
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={11}
      />
      <UiControls />
    </DemoFrame>
  );
}
