import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSphereContext } from "@/context/SphereContext";
import {
  fromRouteLabelValue,
  fromRouteModeValue,
  toRouteLabelValue,
  toRouteLineValue,
  toRouteModeValue,
  toRouteRestrictValue,
  toRouteTypeValue,
} from "@/internal/enums";
import { toSphereGeometryOptions } from "@/internal/geometry";
import { isDeepEqual, useLatest } from "@/internal/hooks";
import { useActiveMap } from "@/internal/useActiveMap";
import type {
  GeometryOptions,
  Language,
  Location,
  RouteGuideStep,
  RouteLabelType,
  RouteLabelValue,
  RouteLineType,
  RouteMode,
  RouteModeValue,
  RouteRestrictType,
  RouteResult,
  RouteType,
  SphereGeometryOptions,
  SphereMarker,
  SphereNamespace,
  SpherePolyline,
  SphereRoute,
} from "@/types";
import { getTurnInstruction } from "@/utils/routeGuide";

/** A turn-by-turn step with display-ready text. */
export interface RouteStep extends RouteGuideStep {
  /** Formatted distance, e.g. `"640 m"`. */
  distanceText: string;
  /** Readable instruction, e.g. `"Turn right to Sathon Nuea Rd"`. */
  instruction: string;
  /** Formatted travel time, or `""` when unavailable. */
  intervalText: string;
  /** Index of the leg (pair of consecutive destinations) the step belongs to. */
  legIndex: number;
}

/** Totals of the calculated route. */
export interface RouteSummary {
  /** Total distance in meters. */
  distance: number;
  /** Formatted total distance, e.g. `"12.4 km"`. */
  distanceText: string;
  /** Total travel time in seconds. */
  interval: number;
  /**
   * Formatted total travel time, e.g. `"25 min"`, or `""` when there is
   * none (straight-line Fly routes).
   */
  intervalText: string;
}

export type RouteStatus = "idle" | "calculating" | "complete" | "error";

/** Why a route could not be calculated. */
export interface RouteErrorInfo {
  /**
   * Sphere's status code, `"timeout"` when the routing service did not
   * answer (usually because the API key lacks the routing service), or
   * `"exception"` when Sphere threw while planning the route.
   */
  code: number | "timeout" | "exception";
  message: string;
}

export interface UseRouteOptions {
  /**
   * Re-calculate automatically whenever the stops change, including when
   * users drag them. Same as calling `setAuto`. Leave it out to keep
   * Sphere's setting (off by default).
   */
  auto?: boolean;
  /** Called with the error for both service errors and timeouts. */
  onError?: (error: RouteErrorInfo) => void;
  /** Called with the calculated legs. */
  onRouteComplete?: (routes: RouteResult[]) => void;
  /** Called with Sphere's status code when routing fails. */
  onRouteError?: (status: number) => void;
  /**
   * Milliseconds to wait for a result after `search()` before reporting a
   * `"timeout"` error. Default `20000`, and `0` disables the timeout.
   */
  timeout?: number;
}

export interface UseRouteReturn {
  /** Add a destination (a location or an existing marker), optionally with its own mode. */
  addDestination: (
    destination: SphereMarker | Location,
    mode?: RouteMode
  ) => void;
  /** Remove destinations and the path. */
  clear: () => void;
  clearDestinations: () => void;
  clearPath: () => void;
  /**
   * The stops, in order. Updates when stops are added, inserted, removed,
   * reversed or cleared, and when users drag or remove them on the map.
   */
  destinations: Location[];
  /** Enable route planning from the map's right-click menu. */
  enableContextMenu: () => void;
  /** Allow or avoid a kind of route (roads, ferries, tollways). */
  enableRouteType: (routeType: RouteType, state: boolean) => void;
  /** Error of the last calculation, if any. */
  error: RouteErrorInfo | null;
  /** The route as a single polyline (not added to the map). */
  exportRouteLine: (options?: GeometryOptions) => SpherePolyline | null;
  getAuto: () => boolean | null;
  /** Total distance in meters, or formatted text with `format`. */
  getDistance: (format?: boolean) => number | string;
  /** Raw legs, or Sphere's formatted guide as a `DocumentFragment` with `format`. */
  getGuide: (format?: boolean) => RouteResult[] | DocumentFragment | null;
  /** Total travel time in seconds, or formatted text with `format`. */
  getInterval: (format?: boolean) => number | string;
  getLabel: () => RouteLabelType | null;
  getLanguage: () => Language | null;
  /** Current options of a route line part. */
  getLineStyle: (line: RouteLineType) => SphereGeometryOptions | null;
  getMode: () => RouteMode | null;
  getModeAt: (index: number) => RouteMode | null;
  /** Turn-by-turn steps of the current route. */
  getSteps: () => RouteStep[];
  insertDestination: (
    index: number,
    destination: SphereMarker | Location,
    mode?: RouteMode
  ) => void;
  /** `true` while a calculation is in progress. */
  isCalculating: boolean;
  isReady: boolean;
  isRestrictEnabled: (restrict: RouteRestrictType) => boolean;
  isRouteTypeEnabled: (routeType: RouteType) => boolean;
  listDestinations: () => SphereMarker[];
  removeDestination: (destination: SphereMarker) => void;
  removeDestinationAt: (index: number) => void;
  reverse: () => void;
  /** Legs of the last calculated route. */
  routes: RouteResult[];
  /** Calculate the route between the destinations. */
  search: () => void;
  /** Re-calculate automatically when destinations or settings change. */
  setAuto: (state: boolean) => void;
  setLabel: (label: RouteLabelType) => void;
  setLanguage: (lang: Language) => void;
  /** Style a part of the drawn route (`Road`, `Ferry`, `Destination`, `Focus`). */
  setLineStyle: (line: RouteLineType, options: GeometryOptions) => void;
  setMode: (mode: RouteMode) => void;
  setModeAt: (index: number, mode: RouteMode) => void;
  /** Render Sphere's built-in guide into an element (see also `<RouteGuide>`). */
  setPlaceholder: (element: HTMLElement) => void;
  /** Avoid roads closed to a vehicle type, e.g. `("Bike", true)` for motorcycles. */
  setRestrict: (restrict: RouteRestrictType, state: boolean) => void;
  size: () => number;
  /** Lifecycle of the current calculation. */
  status: RouteStatus;
  /** Turn-by-turn steps of the last calculated route. */
  steps: RouteStep[];
  /** Totals of the last calculated route. */
  summary: RouteSummary | null;
}

const DEFAULT_TIMEOUT_MS = 20_000;

/** Keeps only finished legs (pending legs are numeric request tokens). */
function finishedLegs(value: unknown): RouteResult[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (leg): leg is RouteResult =>
      typeof leg === "object" && leg !== null && "data" in leg
  );
}

/** Whether any leg of the route is planned in Fly (straight line) mode. */
function usesFlyMode(route: SphereRoute, sphere: SphereNamespace): boolean {
  const fly = sphere.RouteMode.Fly;
  return (
    route.mode() === fly ||
    route.list().some((_, index) => route.modeOf(index) === fly)
  );
}

/** Formats with Sphere's utilities, tolerating a missing API. */
function formatWith(
  sphere: SphereNamespace | null,
  kind: "formatDistance" | "formatInterval",
  value: number,
  language: Language
): string {
  const format = sphere?.Util?.[kind];
  return typeof format === "function" ? format(value, language) : String(value);
}

/** Builds display-ready steps from calculated legs. */
function buildSteps(
  routes: RouteResult[],
  sphere: SphereNamespace | null,
  language: Language
): RouteStep[] {
  return routes.flatMap((leg, legIndex) =>
    (leg.guide ?? []).map((step) => ({
      ...step,
      distanceText: formatWith(
        sphere,
        "formatDistance",
        step.distance,
        language
      ),
      instruction: getTurnInstruction(step.turn, step.name, language),
      intervalText:
        typeof step.interval === "number" && step.interval > 0
          ? formatWith(sphere, "formatInterval", step.interval, language)
          : "",
      legIndex,
    }))
  );
}

/** Sums the legs into a summary. */
function buildSummary(
  routes: RouteResult[],
  sphere: SphereNamespace | null,
  language: Language
): RouteSummary | null {
  if (routes.length === 0) {
    return null;
  }
  const distance = routes.reduce(
    (sum, leg) => sum + (leg.data.distance ?? 0),
    0
  );
  const interval = routes.reduce(
    (sum, leg) => sum + (leg.data.interval ?? 0),
    0
  );
  return {
    distance,
    distanceText: formatWith(sphere, "formatDistance", distance, language),
    interval,
    intervalText:
      interval > 0
        ? formatWith(sphere, "formatInterval", interval, language)
        : "",
  };
}

/** Reads the routing language, defaulting to Thai like Sphere. */
function routeLanguage(route: SphereRoute | undefined): Language {
  return route?.language() === "en" ? "en" : "th";
}

/**
 * Route planning on the map: destinations, calculation, settings and
 * reactive results (status, summary and turn-by-turn steps).
 * Works inside `SphereMap` and anywhere else under `SphereProvider`.
 */
export function useRoute(options?: UseRouteOptions): UseRouteReturn {
  const { map, isReady } = useActiveMap();
  const { sphere } = useSphereContext();
  const optionsRef = useLatest(options);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sphere throws when it labels a straight-line (Fly) leg, so route labels
  // are hidden while Fly is in use. This keeps the labels to restore.
  const hiddenLabelRef = useRef<RouteLabelValue | undefined>(undefined);

  const [status, setStatus] = useState<RouteStatus>("idle");
  const [error, setError] = useState<RouteErrorInfo | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [destinations, setDestinations] = useState<Location[]>([]);
  const [language, setLanguageState] = useState<Language>("th");
  const auto = options?.auto;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fail = useCallback(
    (info: RouteErrorInfo) => {
      stopTimer();
      setError(info);
      setStatus("error");
      optionsRef.current?.onError?.(info);
    },
    [stopTimer, optionsRef]
  );

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }

    const handleComplete = (result: RouteResult[]) => {
      stopTimer();
      const legs = finishedLegs(result);
      setLanguageState(routeLanguage(map.Route));
      setRoutes(legs);
      setError(null);
      setStatus("complete");
      optionsRef.current?.onRouteComplete?.(legs);
    };
    const handleError = (code: number) => {
      optionsRef.current?.onRouteError?.(code);
      fail({
        code,
        message:
          code === 410
            ? "No route data at the selected time."
            : `No route to the destination (status ${code}).`,
      });
    };

    map.Event.bind("routeComplete", handleComplete);
    map.Event.bind("routeError", handleError);

    return () => {
      map.Event.unbind("routeComplete", handleComplete);
      map.Event.unbind("routeError", handleError);
      stopTimer();
    };
  }, [map, isReady, optionsRef, stopTimer, fail]);

  const route = map?.Route;

  /** Re-reads the stops from Sphere, keeping the same array when unchanged. */
  const syncDestinations = useCallback(() => {
    const next = (route?.list() ?? []).map((marker) => {
      const { lat, lon } = marker.location();
      return { lat, lon };
    });
    setDestinations((previous) =>
      isDeepEqual(previous, next) ? previous : next
    );
  }, [route]);

  // Stops change on the map too: dragged, or removed from their popup.
  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }
    syncDestinations();
    map.Event.bind("overlayDrop", syncDestinations);
    map.Event.bind("overlayChange", syncDestinations);
    map.Event.bind("routeComplete", syncDestinations);
    return () => {
      map.Event.unbind("overlayDrop", syncDestinations);
      map.Event.unbind("overlayChange", syncDestinations);
      map.Event.unbind("routeComplete", syncDestinations);
    };
  }, [map, isReady, syncDestinations]);

  useEffect(() => {
    if (route && auto !== undefined) {
      route.auto(auto);
    }
  }, [route, auto]);

  /** Hides route labels, remembering the current ones. */
  const hideLabels = useCallback(() => {
    if (!(route && sphere)) {
      return;
    }
    const current = route.label() as RouteLabelValue;
    if (current !== sphere.RouteLabel.Hide) {
      hiddenLabelRef.current = current;
      route.label(sphere.RouteLabel.Hide);
    }
  }, [route, sphere]);

  /** Restores hidden route labels once no leg uses Fly mode. */
  const restoreLabels = useCallback(() => {
    const label = hiddenLabelRef.current;
    if (
      !(route && sphere) ||
      label === undefined ||
      usesFlyMode(route, sphere)
    ) {
      return;
    }
    hiddenLabelRef.current = undefined;
    route.label(label);
  }, [route, sphere]);

  /**
   * Applies a change that may plan legs right away (auto routing), hiding
   * labels first when the change brings in Fly mode.
   */
  const changeSafely = useCallback(
    (targetMode: RouteModeValue | undefined, change: () => void) => {
      if (sphere && targetMode === sphere.RouteMode.Fly) {
        hideLabels();
      }
      change();
      restoreLabels();
    },
    [sphere, hideLabels, restoreLabels]
  );

  const search = useCallback(() => {
    if (!route) {
      return;
    }
    stopTimer();
    setError(null);
    setStatus("calculating");
    const timeout = optionsRef.current?.timeout ?? DEFAULT_TIMEOUT_MS;
    if (timeout > 0) {
      timerRef.current = setTimeout(() => {
        fail({
          code: "timeout",
          message:
            "The routing service did not respond. Check your connection and that your API key has the routing service enabled.",
        });
      }, timeout);
    }
    try {
      if (sphere && usesFlyMode(route, sphere)) {
        hideLabels();
      }
      route.search();
    } catch (cause) {
      fail({
        code: "exception",
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }, [route, sphere, stopTimer, optionsRef, fail, hideLabels]);

  const resetResults = useCallback(() => {
    stopTimer();
    setRoutes([]);
    setError(null);
    setStatus("idle");
  }, [stopTimer]);

  const steps = useMemo(
    () => buildSteps(routes, sphere, language),
    [routes, sphere, language]
  );
  const summary = useMemo(
    () => buildSummary(routes, sphere, language),
    [routes, sphere, language]
  );

  return useMemo<UseRouteReturn>(() => {
    const mode = (value: RouteMode | undefined) =>
      sphere ? toRouteModeValue(sphere, value) : undefined;

    return {
      addDestination: (destination, destinationMode) => {
        const value = mode(destinationMode);
        changeSafely(value, () => route?.add(destination, value));
        syncDestinations();
      },
      clear: () => {
        route?.clear();
        restoreLabels();
        resetResults();
        syncDestinations();
      },
      clearDestinations: () => {
        route?.clearDestination();
        restoreLabels();
        syncDestinations();
      },
      clearPath: () => {
        route?.clearPath();
        resetResults();
      },
      destinations,
      enableContextMenu: () => {
        route?.enableContextMenu();
      },
      enableRouteType: (routeType, state) => {
        const value = sphere ? toRouteTypeValue(sphere, routeType) : undefined;
        if (route && value !== undefined) {
          route.enableRoute(value, state);
        }
      },
      error,
      exportRouteLine: (lineOptions) => {
        if (!(route && finishedLegs(route.guide()).length)) {
          return null;
        }
        return route.exportRouteLine(
          lineOptions && sphere
            ? toSphereGeometryOptions(sphere, lineOptions)
            : undefined
        );
      },
      getAuto: () => {
        const value = route?.auto();
        return typeof value === "boolean" ? value : null;
      },
      getDistance: (format = false) => {
        try {
          return route?.distance(format) ?? 0;
        } catch {
          // Sphere throws while legs are still being calculated.
          return 0;
        }
      },
      getGuide: (format = false) => {
        if (!route) {
          return null;
        }
        try {
          return format ? route.guide(true) : finishedLegs(route.guide());
        } catch {
          return null;
        }
      },
      getInterval: (format = false) => {
        try {
          return route?.interval(format) ?? 0;
        } catch {
          return 0;
        }
      },
      getLabel: () =>
        route && sphere
          ? (fromRouteLabelValue(
              sphere,
              hiddenLabelRef.current ?? route.label()
            ) ?? null)
          : null,
      getLanguage: () => {
        const value = route?.language();
        return value === "th" || value === "en" ? value : null;
      },
      getLineStyle: (line) => {
        const key = sphere ? toRouteLineValue(sphere, line) : undefined;
        // Without a value, line() is a getter returning the options.
        const value = route && key ? route.line(key) : undefined;
        return (value as SphereGeometryOptions | undefined) ?? null;
      },
      getMode: () =>
        route && sphere
          ? (fromRouteModeValue(sphere, route.mode()) ?? null)
          : null,
      getModeAt: (index) => {
        if (!(route && sphere) || index < 0 || index >= route.size()) {
          return null;
        }
        return fromRouteModeValue(sphere, route.modeOf(index)) ?? null;
      },
      getSteps: () =>
        route
          ? buildSteps(
              finishedLegs(route.guide()),
              sphere,
              routeLanguage(route)
            )
          : [],
      insertDestination: (index, destination, destinationMode) => {
        const value = mode(destinationMode);
        changeSafely(value, () => route?.insert(index, destination, value));
        syncDestinations();
      },
      isCalculating: status === "calculating",
      isReady,
      isRestrictEnabled: (restrict) => {
        const value = sphere
          ? toRouteRestrictValue(sphere, restrict)
          : undefined;
        return route && value !== undefined
          ? route.enableRestrict(value) === true
          : false;
      },
      isRouteTypeEnabled: (routeType) => {
        const value = sphere ? toRouteTypeValue(sphere, routeType) : undefined;
        return route && value !== undefined
          ? route.enableRoute(value) === true
          : false;
      },
      listDestinations: () => route?.list() ?? [],
      removeDestination: (destination) => {
        route?.remove(destination);
        restoreLabels();
        syncDestinations();
      },
      removeDestinationAt: (index) => {
        route?.removeAt(index);
        restoreLabels();
        syncDestinations();
      },
      reverse: () => {
        route?.reverse();
        syncDestinations();
      },
      routes,
      search,
      setAuto: (state) => {
        route?.auto(state);
      },
      setLabel: (label) => {
        const value = sphere ? toRouteLabelValue(sphere, label) : undefined;
        if (!(route && sphere) || value === undefined) {
          return;
        }
        if (usesFlyMode(route, sphere) && value !== sphere.RouteLabel.Hide) {
          // Applied once Fly mode is no longer used (see hideLabels).
          hiddenLabelRef.current = value;
          return;
        }
        hiddenLabelRef.current = undefined;
        route.label(value);
      },
      setLanguage: (lang) => {
        route?.language(lang);
        setLanguageState(lang);
      },
      setLineStyle: (line, lineOptions) => {
        const key = sphere ? toRouteLineValue(sphere, line) : undefined;
        if (route && sphere && key) {
          route.line(key, toSphereGeometryOptions(sphere, lineOptions));
        }
      },
      setMode: (newMode) => {
        const value = mode(newMode);
        if (route && value) {
          changeSafely(value, () => route.mode(value));
        }
      },
      setModeAt: (index, newMode) => {
        const value = mode(newMode);
        if (route && value && index >= 0 && index < route.size()) {
          changeSafely(value, () => route.modeOf(index, value));
        }
      },
      setPlaceholder: (element) => {
        route?.placeholder(element);
      },
      setRestrict: (restrict, state) => {
        const value = sphere
          ? toRouteRestrictValue(sphere, restrict)
          : undefined;
        if (route && value !== undefined) {
          route.enableRestrict(value, state);
        }
      },
      size: () => route?.size() ?? 0,
      status,
      steps,
      summary,
    };
  }, [
    route,
    sphere,
    isReady,
    status,
    error,
    routes,
    steps,
    summary,
    search,
    resetResults,
    changeSafely,
    restoreLabels,
    destinations,
    syncDestinations,
  ]);
}
