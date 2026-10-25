import type { Language, RouteTurnCode } from "@/types";

/**
 * Turn codes used by Sphere route guides (JS API and REST routing service).
 */
export const ROUTE_TURN = {
  Arrive: 9,
  /** Enter an expressway/tollway. */
  EnterExpressway: 6,
  Ferry: 11,
  /** Continue along / head toward the road. */
  HeadToward: 4,
  SlightLeft: 2,
  SlightRight: 3,
  Straight: 5,
  TurnLeft: 0,
  TurnRight: 1,
  UTurn: 7,
} as const satisfies Record<string, RouteTurnCode>;

interface TurnPhrase {
  /** Phrase used when the step has no road name. */
  alone: string;
  /** Phrase placed before the road name; empty to show the name alone. */
  to: string;
}

/**
 * Instruction phrases per turn code. Phrases before a road name match
 * Sphere's built-in route guide.
 */
const TURN_PHRASES: Record<
  Language,
  Partial<Record<RouteTurnCode, TurnPhrase>>
> = {
  en: {
    [ROUTE_TURN.TurnLeft]: { alone: "Turn left", to: "Turn left to" },
    [ROUTE_TURN.TurnRight]: { alone: "Turn right", to: "Turn right to" },
    [ROUTE_TURN.SlightLeft]: { alone: "Slight left", to: "Slight left to" },
    [ROUTE_TURN.SlightRight]: { alone: "Slight right", to: "Slight right to" },
    [ROUTE_TURN.HeadToward]: {
      alone: "Head to the next stop",
      to: "Head toward",
    },
    [ROUTE_TURN.Straight]: {
      alone: "Continue straight",
      to: "Continue straight onto",
    },
    [ROUTE_TURN.EnterExpressway]: {
      alone: "Enter the expressway",
      to: "Enter",
    },
    [ROUTE_TURN.UTurn]: { alone: "Make a U-turn", to: "U-turn at" },
    [ROUTE_TURN.Arrive]: {
      alone: "Arrive at the destination",
      to: "Arrive at",
    },
    [ROUTE_TURN.Ferry]: { alone: "Take the ferry", to: "" },
  },
  th: {
    [ROUTE_TURN.TurnLeft]: { alone: "เลี้ยวซ้าย", to: "เลี้ยวซ้ายสู่" },
    [ROUTE_TURN.TurnRight]: { alone: "เลี้ยวขวา", to: "เลี้ยวขวาสู่" },
    [ROUTE_TURN.SlightLeft]: { alone: "เบี่ยงซ้าย", to: "เบี่ยงซ้ายสู่" },
    [ROUTE_TURN.SlightRight]: { alone: "เบี่ยงขวา", to: "เบี่ยงขวาสู่" },
    [ROUTE_TURN.HeadToward]: { alone: "มุ่งหน้าไปยังจุดถัดไป", to: "ไปตาม" },
    [ROUTE_TURN.Straight]: { alone: "ตรงไป", to: "ตรงไปตาม" },
    [ROUTE_TURN.EnterExpressway]: { alone: "เข้าทางด่วน", to: "เข้าสู่" },
    [ROUTE_TURN.UTurn]: { alone: "กลับรถ", to: "กลับรถที่" },
    [ROUTE_TURN.Arrive]: { alone: "ถึงจุดหมาย", to: "ถึง" },
    [ROUTE_TURN.Ferry]: { alone: "ลงเรือข้ามฟาก", to: "" },
  },
};

/** Road name Sphere gives straight-line (Fly) steps, which have no road. */
const NO_ROAD_NAME = "?";

/**
 * Builds a readable instruction for a route step, e.g.
 * `"Turn right to Sathon Nuea Rd"` / `"เลี้ยวขวาสู่ ถนนสาทรเหนือ"`.
 * Steps without a road name get a phrase of their own (`"Turn right"`);
 * ferry steps show the ferry's name, as in Sphere's built-in guide.
 */
export function getTurnInstruction(
  turn: RouteTurnCode,
  roadName: string | null | undefined,
  language: Language = "en"
): string {
  // Service data can omit the name; treat it like a step without a road.
  const name =
    typeof roadName === "string" && roadName !== NO_ROAD_NAME
      ? roadName.trim()
      : "";
  const phrase = TURN_PHRASES[language === "th" ? "th" : "en"][turn];
  if (!phrase) {
    return name;
  }
  if (!name) {
    return phrase.alone;
  }
  return phrase.to ? `${phrase.to} ${name}` : name;
}
