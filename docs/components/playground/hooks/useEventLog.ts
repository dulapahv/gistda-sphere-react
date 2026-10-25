import { useState, useSyncExternalStore } from "react";

export interface EventLogEntry {
  /** Short description of the event's arguments. */
  detail: string;
  id: number;
  name: string;
  time: string;
}

/** Events that fire continuously while the map moves or renders. */
const NOISY_EVENTS = new Set([
  "drag",
  "idle",
  "location",
  "mousemove",
  "pitch",
  "repaint",
  "resize",
  "rotate",
  "tileLoaded",
  "tileLoading",
  "tooltipChange",
  "wheel",
  "zoom",
]);

const MAX_ENTRIES = 100;
const MAX_DETAIL_LENGTH = 90;

/** Rounds coordinates for display. */
function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

/** Whether a value looks like `{ lat, lon }`. */
function hasLocation(value: object): value is { lat: number; lon: number } {
  return (
    "lat" in value &&
    "lon" in value &&
    typeof value.lat === "number" &&
    typeof value.lon === "number"
  );
}

/** Reads an overlay's location without letting a runtime error escape. */
function overlayLocation(value: { location: () => unknown }): string {
  try {
    const location = value.location();
    if (location && typeof location === "object" && hasLocation(location)) {
      return `@ ${formatNumber(location.lat)}, ${formatNumber(location.lon)}`;
    }
  } catch {
    // Some overlays cannot report a location while being removed.
  }
  return "";
}

/** Turns one event argument into short readable text. */
function describe(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "number") {
    return formatNumber(value);
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length}]`;
  }
  if (typeof value === "object") {
    if (hasLocation(value)) {
      return `${formatNumber(value.lat)}, ${formatNumber(value.lon)}`;
    }
    if ("location" in value && typeof value.location === "function") {
      return `overlay ${overlayLocation(value as { location: () => unknown })}`.trim();
    }
    if (value instanceof Error) {
      return value.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "{…}";
    }
  }
  return typeof value;
}

/** A small external store, so logging events never re-renders the map. */
export interface EventLogStore {
  clear: () => void;
  getSnapshot: () => EventLogEntry[];
  isVerbose: () => boolean;
  log: (name: string, args: unknown[]) => void;
  setVerbose: (verbose: boolean) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Creates an event log store. */
function createEventLogStore(): EventLogStore {
  let entries: EventLogEntry[] = [];
  let verbose = false;
  let nextId = 1;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    clear: () => {
      entries = [];
      notify();
    },
    getSnapshot: () => entries,
    isVerbose: () => verbose,
    log: (name, args) => {
      if (!verbose && NOISY_EVENTS.has(name)) {
        return;
      }
      const detail = args.map(describe).filter(Boolean).join(" · ");
      const entry: EventLogEntry = {
        detail:
          detail.length > MAX_DETAIL_LENGTH
            ? `${detail.slice(0, MAX_DETAIL_LENGTH)}…`
            : detail,
        id: nextId,
        name,
        time: new Date().toLocaleTimeString([], { hour12: false }),
      };
      nextId += 1;
      entries = [entry, ...entries].slice(0, MAX_ENTRIES);
      notify();
    },
    setVerbose: (value) => {
      verbose = value;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Creates the playground's event log store once. */
export function useEventLog(): EventLogStore {
  const [store] = useState(createEventLogStore);
  return store;
}

const EMPTY: EventLogEntry[] = [];

/** Subscribes to the entries of an event log store. */
export function useEventEntries(store: EventLogStore): EventLogEntry[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);
}
