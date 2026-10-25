"use client";

import {
  type Location,
  Marker,
  type RouteErrorInfo,
  RouteGuide,
  type RouteMode,
  SphereMap,
  useRoute,
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

const BANGKOK: Location = { lat: 13.7563, lon: 100.5018 };
const CHIANG_MAI: Location = { lat: 18.7883, lon: 98.9853 };
const MODES = [
  "Traffic",
  "Distance",
  "Fly",
] as const satisfies readonly RouteMode[];

const TEXT = {
  en: {
    builtIn: "Sphere's guide",
    calculate: "Calculate route",
    calculating: "Calculating…",
    clear: "Clear",
    destination: "Chiang Mai (destination)",
    distance: "Distance",
    duration: "Travel time",
    exception: (message: string) =>
      `Sphere couldn't plan the route: ${message}`,
    failed: (code: number) => `Routing failed (status ${code}).`,
    hideSteps: "Hide directions",
    modes: {
      Distance: "Shortest",
      Fly: "Straight line",
      Traffic: "Avoid traffic",
    },
    origin: "Bangkok (origin)",
    showSteps: (count: number) => `Turn-by-turn (${count})`,
    timeout:
      "The routing service didn't answer. Check that your API key has the routing service enabled, or try Straight line.",
    title: "Bangkok → Chiang Mai",
  },
  th: {
    builtIn: "คำแนะนำของ Sphere",
    calculate: "คำนวณเส้นทาง",
    calculating: "กำลังคำนวณ…",
    clear: "ล้าง",
    destination: "เชียงใหม่ (ปลายทาง)",
    distance: "ระยะทาง",
    duration: "เวลาเดินทาง",
    exception: (message: string) => `Sphere วางแผนเส้นทางไม่ได้: ${message}`,
    failed: (code: number) => `ค้นหาเส้นทางไม่สำเร็จ (สถานะ ${code})`,
    hideSteps: "ซ่อนคำแนะนำ",
    modes: { Distance: "สั้นที่สุด", Fly: "เส้นตรง", Traffic: "เลี่ยงรถติด" },
    origin: "กรุงเทพฯ (ต้นทาง)",
    showSteps: (count: number) => `นำทางทีละขั้น (${count})`,
    timeout:
      "บริการนำทางไม่ตอบกลับ ตรวจสอบว่า API key ของคุณเปิดบริการนำทางแล้ว หรือลองโหมดเส้นตรง",
    title: "กรุงเทพฯ → เชียงใหม่",
  },
};

type Text = (typeof TEXT)["en"];

/** Explains a routing error. */
function errorMessage(text: Text, error: RouteErrorInfo): string {
  if (error.code === "timeout") {
    return text.timeout;
  }
  if (error.code === "exception") {
    return text.exception(error.message);
  }
  return text.failed(error.code);
}

/** Plans Bangkok → Chiang Mai with `useRoute` and lists the steps. */
function RoutePlanner() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [mode, setMode] = useState<RouteMode>("Traffic");
  const [showSteps, setShowSteps] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const route = useRoute();
  const { error, isReady, status, steps, summary } = route;

  const calculate = () => {
    route.clear();
    route.setMode(mode);
    route.addDestination(BANGKOK);
    route.addDestination(CHIANG_MAI);
    route.search();
  };

  return (
    <>
      <SphereMap
        center={{ lat: 16.27, lon: 99.75 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={6}
      >
        {/* Sphere draws its own stop markers once the route is planned. */}
        {status === "idle" ? (
          <>
            <Marker position={BANGKOK} title={text.origin} />
            <Marker position={CHIANG_MAI} title={text.destination} />
          </>
        ) : null}
      </SphereMap>
      <DemoBar>
        <DemoNote>{text.title}</DemoNote>
        {MODES.map((option) => (
          <DemoButton
            active={mode === option}
            key={option}
            onClick={() => setMode(option)}
          >
            {text.modes[option]}
          </DemoButton>
        ))}
        <DemoButton
          disabled={!isReady || status === "calculating"}
          onClick={calculate}
        >
          {status === "calculating" ? text.calculating : text.calculate}
        </DemoButton>
        {status === "idle" ? null : (
          <DemoButton onClick={route.clear}>{text.clear}</DemoButton>
        )}
        <DemoButton active={showGuide} onClick={() => setShowGuide(!showGuide)}>
          {text.builtIn}
        </DemoButton>

        {error ? (
          <p className="m-0 w-full rounded-md border border-fd-error/40 bg-fd-error/10 px-2 py-1.5 text-fd-error text-xs">
            {errorMessage(text, error)}
          </p>
        ) : null}

        {summary ? (
          <div className="w-full rounded-md border border-fd-border bg-fd-muted px-2 py-1.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-fd-muted-foreground">{text.distance}</span>
              <span className="font-medium">{summary.distanceText}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-fd-muted-foreground">{text.duration}</span>
              <span className="font-medium">{summary.intervalText || "–"}</span>
            </div>
            <DemoButton onClick={() => setShowSteps(!showSteps)}>
              {showSteps ? text.hideSteps : text.showSteps(steps.length)}
            </DemoButton>
          </div>
        ) : null}

        {summary && showSteps ? (
          <ol className="m-0 max-h-60 w-full list-none overflow-y-auto rounded-md border border-fd-border bg-fd-muted p-0">
            {steps.map((step, index) => (
              <li
                className="flex items-start gap-2 border-fd-border border-b px-2 py-1.5 text-xs last:border-b-0"
                // Steps are rebuilt per route and never reordered.
                // biome-ignore lint/suspicious/noArrayIndexKey: steps have no ids
                key={index}
              >
                <span className="shrink-0 font-medium text-fd-muted-foreground">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <p className="m-0">{step.instruction}</p>
                  <p className="m-0 text-fd-muted-foreground">
                    {[step.distanceText, step.intervalText]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        {showGuide ? (
          <RouteGuide className="max-h-72 w-full overflow-y-auto rounded-md border border-fd-border bg-white text-black text-xs" />
        ) : null}
      </DemoBar>
    </>
  );
}

export function RouteDemo() {
  return (
    <DemoFrame height="480px">
      <RoutePlanner />
    </DemoFrame>
  );
}
