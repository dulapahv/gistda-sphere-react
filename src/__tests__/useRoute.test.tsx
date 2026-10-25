import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRoute } from "@/hooks/useRoute";
import type { RouteResult } from "@/types";
import { createProviderWrapper } from "./helpers";
import { createMockSphereApi } from "./setup";

/** A finished leg as Sphere reports it in `routeComplete`. */
function leg(distance: number, interval: number): RouteResult {
  return {
    data: { distance, interval },
    guide: [
      { distance: 144, interval: 15, name: "Sathon Tai Rd", turn: 4 },
      { distance: 640, interval: 60, name: "Sathon Nuea Rd", turn: 1 },
    ],
    meta: { status: 200 },
    path: [],
  };
}

describe("useRoute", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();

    map.Route = {
      add: vi.fn(),
      auto: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
      clearDestination: vi.fn(),
      clearPath: vi.fn(),
      distance: vi.fn().mockReturnValue(450),
      enableContextMenu: vi.fn(),
      enableRestrict: vi.fn().mockReturnValue(true),
      enableRoute: vi.fn().mockReturnValue(true),
      exportRouteLine: vi.fn().mockReturnValue({ kind: "polyline" }),
      guide: vi.fn().mockReturnValue([]),
      insert: vi.fn(),
      interval: vi.fn().mockReturnValue(19_800),
      label: vi.fn().mockReturnValue("d"),
      language: vi.fn().mockReturnValue("en"),
      line: vi.fn().mockReturnValue({ lineWidth: 4 }),
      list: vi.fn().mockReturnValue([]),
      mode: vi.fn().mockReturnValue("d"),
      modeOf: vi.fn().mockReturnValue("c"),
      placeholder: vi.fn(),
      remove: vi.fn(),
      removeAt: vi.fn(),
      reverse: vi.fn(),
      search: vi.fn(),
      size: vi.fn().mockReturnValue(2),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    window.sphere = undefined;
  });

  const render = (options?: Parameters<typeof useRoute>[0]) =>
    renderHook(() => useRoute(options), {
      wrapper: createProviderWrapper(map),
    });

  describe("destinations", () => {
    it("adds a destination without a mode", () => {
      const { result } = render();
      const location = { lat: 13.75, lon: 100.5 };
      result.current.addDestination(location);
      expect(map.Route.add).toHaveBeenCalledWith(location, undefined);
    });

    it("converts the destination mode to Sphere's letter code", () => {
      const { result } = render();
      const location = { lat: 13.75, lon: 100.5 };
      result.current.addDestination(location, "Distance");
      result.current.insertDestination(1, location, "Traffic");
      expect(map.Route.add).toHaveBeenCalledWith(location, "d");
      expect(map.Route.insert).toHaveBeenCalledWith(1, location, "t");
    });

    it("removes and lists destinations", () => {
      const { result } = render();
      const marker = {} as never;
      result.current.removeDestination(marker);
      result.current.removeDestinationAt(0);
      result.current.clearDestinations();
      expect(map.Route.remove).toHaveBeenCalledWith(marker);
      expect(map.Route.removeAt).toHaveBeenCalledWith(0);
      expect(map.Route.clearDestination).toHaveBeenCalled();
      expect(result.current.listDestinations()).toEqual([]);
      expect(result.current.size()).toBe(2);
    });
  });

  describe("calculation state", () => {
    it("tracks a calculation from search to completion", () => {
      const onRouteComplete = vi.fn();
      const { result } = render({ onRouteComplete });

      act(() => result.current.search());
      expect(map.Route.search).toHaveBeenCalled();
      expect(result.current.status).toBe("calculating");
      expect(result.current.isCalculating).toBe(true);

      const legs = [leg(784, 75)];
      act(() => {
        map.Event.fire("routeComplete", legs);
      });

      expect(result.current.status).toBe("complete");
      expect(result.current.routes).toEqual(legs);
      expect(onRouteComplete).toHaveBeenCalledWith(legs);
    });

    it("builds readable turn-by-turn steps in the route language", () => {
      const { result } = render();
      act(() => {
        map.Event.fire("routeComplete", [leg(784, 75)]);
      });

      expect(result.current.steps).toEqual([
        expect.objectContaining({
          distanceText: "144 m en",
          instruction: "Head toward Sathon Tai Rd",
          intervalText: "15 s en",
          legIndex: 0,
          turn: 4,
        }),
        expect.objectContaining({
          instruction: "Turn right to Sathon Nuea Rd",
          name: "Sathon Nuea Rd",
        }),
      ]);
    });

    it("sums the legs into a summary", () => {
      const { result } = render();
      act(() => {
        map.Event.fire("routeComplete", [leg(1000, 60), leg(500, 30)]);
      });
      expect(result.current.summary).toEqual({
        distance: 1500,
        distanceText: "1500 m en",
        interval: 90,
        intervalText: "90 s en",
      });
    });

    it("handles straight-line (Fly) legs, which have no time or road", () => {
      const { result } = render();
      const flyLeg: RouteResult = {
        data: { distance: 47_300, interval: 0 },
        guide: [{ distance: 47_300, name: "?", turn: 4 }],
        path: [],
      };
      act(() => {
        map.Event.fire("routeComplete", [flyLeg]);
      });
      expect(result.current.summary?.intervalText).toBe("");
      expect(result.current.steps[0]).toMatchObject({
        instruction: "Head to the next stop",
        intervalText: "",
      });
    });

    it("ignores pending legs (numeric request tokens)", () => {
      const { result } = render();
      act(() => {
        map.Event.fire("routeComplete", [74_940, leg(10, 1)]);
      });
      expect(result.current.routes).toHaveLength(1);
    });

    it("reports Sphere routing errors", () => {
      const onRouteError = vi.fn();
      const onError = vi.fn();
      const { result } = render({ onError, onRouteError });

      act(() => result.current.search());
      act(() => {
        map.Event.fire("routeError", 410);
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toEqual({
        code: 410,
        message: "No route data at the selected time.",
      });
      expect(onRouteError).toHaveBeenCalledWith(410);
      expect(onError).toHaveBeenCalledWith(result.current.error);
    });

    it("times out when the service never answers", () => {
      vi.useFakeTimers();
      const onError = vi.fn();
      const { result } = render({ onError, timeout: 5000 });

      act(() => result.current.search());
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error?.code).toBe("timeout");
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "timeout" })
      );
    });

    it("does not time out when the route completes in time", () => {
      vi.useFakeTimers();
      const { result } = render({ timeout: 5000 });

      act(() => result.current.search());
      act(() => {
        map.Event.fire("routeComplete", [leg(1, 1)]);
        vi.advanceTimersByTime(10_000);
      });

      expect(result.current.status).toBe("complete");
    });

    it("can disable the timeout", () => {
      vi.useFakeTimers();
      const { result } = render({ timeout: 0 });
      act(() => result.current.search());
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(result.current.status).toBe("calculating");
    });

    it("resets results when cleared", () => {
      const { result } = render();
      act(() => {
        map.Event.fire("routeComplete", [leg(1, 1)]);
      });
      act(() => result.current.clear());
      expect(map.Route.clear).toHaveBeenCalled();
      expect(result.current.status).toBe("idle");
      expect(result.current.routes).toEqual([]);

      act(() => result.current.clearPath());
      expect(map.Route.clearPath).toHaveBeenCalled();
    });
  });

  describe("route data getters", () => {
    it("returns totals, tolerating Sphere's throwing getters", () => {
      const { result } = render();
      expect(result.current.getDistance()).toBe(450);
      expect(result.current.getInterval(true)).toBe(19_800);

      map.Route.distance.mockImplementation(() => {
        throw new TypeError("Cannot read properties of undefined");
      });
      map.Route.interval.mockImplementation(() => {
        throw new TypeError("Cannot read properties of undefined");
      });
      expect(result.current.getDistance()).toBe(0);
      expect(result.current.getInterval()).toBe(0);
    });

    it("returns finished legs or the formatted guide", () => {
      const fragment = document.createDocumentFragment();
      map.Route.guide.mockImplementation((format?: boolean) =>
        format ? fragment : [123, leg(1, 1)]
      );
      const { result } = render();
      expect(result.current.getGuide()).toEqual([leg(1, 1)]);
      expect(result.current.getGuide(true)).toBe(fragment);
    });

    it("returns null when the formatted guide is not available yet", () => {
      map.Route.guide.mockImplementation(() => {
        throw new TypeError("reading 'fdistance'");
      });
      const { result } = render();
      expect(result.current.getGuide(true)).toBeNull();
    });

    it("builds steps on demand", () => {
      map.Route.guide.mockReturnValue([leg(1, 1)]);
      const { result } = render();
      expect(result.current.getSteps()).toHaveLength(2);
    });

    it("exports the route line only when a route exists", () => {
      const { result } = render();
      expect(result.current.exportRouteLine()).toBeNull();

      map.Route.guide.mockReturnValue([leg(1, 1)]);
      expect(
        result.current.exportRouteLine({ lineColor: "red", lineStyle: "Dot" })
      ).toEqual({ kind: "polyline" });
      expect(map.Route.exportRouteLine).toHaveBeenCalledWith({
        lineColor: "red",
        lineStyle: [2, 2],
      });
    });
  });

  describe("settings", () => {
    it("maps route modes in both directions", () => {
      const { result } = render();
      result.current.setMode("Traffic");
      expect(map.Route.mode).toHaveBeenCalledWith("t");
      expect(result.current.getMode()).toBe("Distance");
    });

    it("sets and reads the mode of one destination within bounds", () => {
      const { result } = render();
      result.current.setModeAt(1, "Cost");
      expect(map.Route.modeOf).toHaveBeenCalledWith(1, "c");
      expect(result.current.getModeAt(0)).toBe("Cost");

      map.Route.modeOf.mockClear();
      result.current.setModeAt(5, "Cost");
      expect(result.current.getModeAt(5)).toBeNull();
      expect(map.Route.modeOf).not.toHaveBeenCalled();
    });

    it("uses route type bit flags", () => {
      const { result } = render();
      result.current.enableRouteType("Tollway", false);
      expect(map.Route.enableRoute).toHaveBeenCalledWith(16, false);
      expect(result.current.isRouteTypeEnabled("Ferry")).toBe(true);
      expect(map.Route.enableRoute).toHaveBeenCalledWith(8);
    });

    it("sets vehicle restrictions", () => {
      const { result } = render();
      result.current.setRestrict("Bike", true);
      expect(map.Route.enableRestrict).toHaveBeenCalledWith(1, true);
      expect(result.current.isRestrictEnabled("Bike")).toBe(true);
    });

    it("maps route labels, including Hide", () => {
      const { result } = render();
      result.current.setLabel("Hide");
      expect(map.Route.label).toHaveBeenCalledWith(false);
      result.current.setLabel("Time");
      expect(map.Route.label).toHaveBeenCalledWith("t");
      expect(result.current.getLabel()).toBe("Distance");
    });

    it("styles route lines with converted options", () => {
      const { result } = render();
      result.current.setLineStyle("Road", {
        lineColor: "#f00",
        lineStyle: "Dashed",
      });
      expect(map.Route.line).toHaveBeenCalledWith("road", {
        lineColor: "#f00",
        lineStyle: [6, 4],
      });
      expect(result.current.getLineStyle("Focus")).toEqual({ lineWidth: 4 });
      expect(map.Route.line).toHaveBeenCalledWith("focus");
    });

    it("delegates the remaining settings", () => {
      const { result } = render();
      const element = document.createElement("div");
      result.current.setAuto(true);
      result.current.setLanguage("th");
      result.current.enableContextMenu();
      result.current.setPlaceholder(element);
      result.current.reverse();

      expect(map.Route.auto).toHaveBeenCalledWith(true);
      expect(map.Route.language).toHaveBeenCalledWith("th");
      expect(map.Route.enableContextMenu).toHaveBeenCalled();
      expect(map.Route.placeholder).toHaveBeenCalledWith(element);
      expect(map.Route.reverse).toHaveBeenCalled();
      expect(result.current.getAuto()).toBe(false);
      expect(result.current.getLanguage()).toBe("en");
    });
  });

  describe("Fly mode", () => {
    /**
     * Makes the Route mock remember its label and mode, and records every
     * change in order, as `label:<value>` and `mode:<value>`.
     */
    function trackRouteSettings() {
      const changes: string[] = [];
      const settings: Record<string, unknown> = { label: "d", mode: "t" };
      for (const name of ["label", "mode"]) {
        map.Route[name] = vi.fn((value?: unknown) => {
          if (value === undefined) {
            return settings[name];
          }
          settings[name] = value;
          changes.push(`${name}:${String(value)}`);
          return map.Route;
        });
      }
      map.Route.modeOf = vi.fn().mockReturnValue(undefined);
      // Destination markers, as Sphere returns them.
      const stop = () => ({ location: () => ({ lat: 13.75, lon: 100.5 }) });
      map.Route.list = vi.fn().mockReturnValue([stop(), stop()]);
      return changes;
    }

    it("hides labels while Fly is used and restores them after", () => {
      const changes = trackRouteSettings();
      const { result } = render();

      act(() => result.current.setMode("Fly"));
      // Labels go first: Sphere re-plans (and labels) as soon as the mode changes.
      expect(changes).toEqual(["label:false", "mode:f"]);
      expect(result.current.getLabel()).toBe("Distance");

      act(() => result.current.setLabel("Time"));
      expect(changes).toEqual(["label:false", "mode:f"]);
      expect(result.current.getLabel()).toBe("Time");

      act(() => result.current.setMode("Traffic"));
      expect(changes).toEqual(["label:false", "mode:f", "mode:t", "label:t"]);
    });

    it("hides labels before searching when a stop uses Fly", () => {
      const changes = trackRouteSettings();
      map.Route.modeOf = vi.fn().mockReturnValue("f");
      map.Route.search = vi.fn(() => changes.push("search"));
      const { result } = render();

      act(() => result.current.search());
      expect(changes).toEqual(["label:false", "search"]);
    });

    it("hides labels before adding a Fly stop", () => {
      const changes = trackRouteSettings();
      map.Route.add = vi.fn(() => changes.push("add"));
      const { result } = render();

      act(() => result.current.addDestination({ lat: 13, lon: 100 }, "Fly"));
      expect(changes[0]).toBe("label:false");
      expect(changes).toContain("add");
    });
  });

  it("reports exceptions Sphere throws while planning", () => {
    map.Route.search = vi.fn(() => {
      throw new TypeError("Cannot read properties of undefined");
    });
    const onError = vi.fn();
    const { result } = render({ onError });

    act(() => result.current.search());
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual({
      code: "exception",
      message: "Cannot read properties of undefined",
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
