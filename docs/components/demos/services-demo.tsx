"use client";

import { SphereServiceError, useSphereServices } from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const VICTORY_MONUMENT = { lat: 13.7649, lon: 100.5383 };

type Call = "categories" | "search" | "nearby" | "address" | "elevation";
const CALLS: readonly Call[] = [
  "categories",
  "search",
  "nearby",
  "address",
  "elevation",
];

const TEXT = {
  en: {
    calls: {
      address: "Address",
      categories: "Tag categories",
      elevation: "Elevation",
      nearby: "Nearby places",
      search: "Search “hospital”",
    },
    errors: {
      aborted: "Canceled.",
      http: "The service returned an error.",
      key: "This API key can't use this service yet. Enable it in the Sphere console.",
      network: "Network error.",
      parse: "The response wasn't JSON.",
      timeout: "The service didn't answer in time.",
    },
    hint: "Each button calls a Sphere web service around Victory Monument.",
  },
  th: {
    calls: {
      address: "ที่อยู่",
      categories: "หมวดหมู่แท็ก",
      elevation: "ความสูง",
      nearby: "สถานที่ใกล้เคียง",
      search: "ค้นหา “โรงพยาบาล”",
    },
    errors: {
      aborted: "ยกเลิกแล้ว",
      http: "บริการตอบกลับด้วยข้อผิดพลาด",
      key: "API key นี้ยังใช้บริการนี้ไม่ได้ เปิดใช้งานได้ใน Sphere console",
      network: "เชื่อมต่อเครือข่ายไม่สำเร็จ",
      parse: "ข้อมูลที่ตอบกลับไม่ใช่ JSON",
      timeout: "บริการไม่ตอบกลับภายในเวลาที่กำหนด",
    },
    hint: "แต่ละปุ่มเรียกบริการเว็บของ Sphere บริเวณอนุสาวรีย์ชัยสมรภูมิ",
  },
};

/** Calls a few REST services with `useSphereServices` and shows the JSON. */
function ServiceCalls() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const services = useSphereServices({ locale: language });
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const call = async (name: Call) => {
    setBusy(true);
    setError(null);
    try {
      const requests: Record<Call, () => Promise<unknown>> = {
        address: () => services.geo.address(VICTORY_MONUMENT),
        categories: () => services.tags.categories(),
        elevation: () => services.geo.elevation(VICTORY_MONUMENT),
        nearby: () => services.poi.nearby(VICTORY_MONUMENT, { limit: 3 }),
        search: () =>
          services.search.search(language === "th" ? "โรงพยาบาล" : "hospital", {
            limit: 3,
            near: VICTORY_MONUMENT,
          }),
      };
      const data = await requests[name]();
      setOutput(JSON.stringify(data, null, 2).slice(0, 3000));
    } catch (reason) {
      setOutput("");
      setError(
        reason instanceof SphereServiceError
          ? `${text.errors[reason.code]} (${reason.service})`
          : String(reason)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DemoBar>
      {CALLS.map((name) => (
        <DemoButton disabled={busy} key={name} onClick={() => call(name)}>
          {text.calls[name]}
        </DemoButton>
      ))}
      <DemoNote>{text.hint}</DemoNote>
      {error ? <DemoNote tone="error">{error}</DemoNote> : null}
      {output ? (
        <pre className="m-0 max-h-64 w-full overflow-auto rounded-md border border-fd-border bg-fd-muted p-2 text-[11px]">
          {output}
        </pre>
      ) : null}
    </DemoBar>
  );
}

export function ServicesDemo() {
  return (
    <DemoFrame height="160px">
      <ServiceCalls />
    </DemoFrame>
  );
}
