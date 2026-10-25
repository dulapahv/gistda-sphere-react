import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Marker } from "@/components/Marker";
import { MarkerCluster } from "@/components/MarkerCluster";
import { SphereMap } from "@/components/SphereMap";
import { SphereProvider, useMapControls } from "@/context/SphereContext";
import { useMapLocation, useMapZoom } from "@/hooks/useMapEvent";
import { useMapView } from "@/hooks/useMapView";
import { useRoute } from "@/hooks/useRoute";
import { useSphereServices } from "@/hooks/useSphereServices";
import { useSuggest } from "@/hooks/useSuggest";
import { clusterPoints, expandBound, isInBound } from "@/internal/cluster";
import type { Location } from "@/types";
import { createProviderWrapper } from "./helpers";
import { createMockSphereApi } from "./setup";

const BANGKOK = { lat: 13.75, lon: 100.5 };
const VIEW = {
  bound: { maxLat: 14, maxLon: 101, minLat: 13, minLon: 100 },
  center: BANGKOK,
  pitch: 0,
  rotate: 0,
  zoom: 10,
};

describe("developer experience features", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;
  const wrapper = createProviderWrapper(mockMap);

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("event values", () => {
    it("passes the zoom and center to useMapZoom and useMapLocation", () => {
      const onZoom = vi.fn();
      const onLocation = vi.fn();
      renderHook(
        () => {
          useMapZoom(onZoom);
          useMapLocation(onLocation);
        },
        { wrapper }
      );
      act(() => {
        map.Event.fire("zoom");
        map.Event.fire("location");
      });
      expect(onZoom).toHaveBeenCalledWith(10);
      expect(onLocation).toHaveBeenCalledWith(BANGKOK);
    });
  });

  describe("view changes", () => {
    it("reports the view when the map is ready and after it stops moving", () => {
      const onViewChange = vi.fn();
      render(
        <SphereProvider apiKey="test-key">
          <SphereMap onViewChange={onViewChange} />
        </SphereProvider>
      );
      act(() => {
        mockMap._triggerReady();
      });
      expect(onViewChange).toHaveBeenLastCalledWith(VIEW);

      map.zoom.mockReturnValueOnce(12);
      act(() => {
        mockMap._fireRenderer("moveend");
      });
      expect(onViewChange).toHaveBeenLastCalledWith({ ...VIEW, zoom: 12 });
    });

    it("useMapView follows the map, and getView reads it", () => {
      const { result } = renderHook(
        () => ({ controls: useMapControls(), view: useMapView() }),
        { wrapper }
      );
      expect(result.current.view).toEqual(VIEW);
      expect(result.current.controls.getView()).toEqual(VIEW);

      map.rotate.mockReturnValueOnce(30);
      act(() => {
        mockMap._fireRenderer("moveend");
      });
      expect(result.current.view).toEqual({ ...VIEW, rotate: 30 });
    });

    it("accepts rotate as another name for bearing in goTo", () => {
      const { result } = renderHook(() => useMapControls(), { wrapper });
      result.current.goTo({ center: BANGKOK, rotate: 45, zoom: 12 });
      expect(map.goTo).toHaveBeenCalledWith(
        { bearing: 45, center: BANGKOK, zoom: 12 },
        true
      );
    });
  });

  describe("provider language", () => {
    function LanguageWrapper({ children }: { children: ReactNode }) {
      return (
        <SphereProvider apiKey="test-key" language="en">
          {children}
        </SphereProvider>
      );
    }

    it("is the default language of maps", () => {
      render(
        <LanguageWrapper>
          <SphereMap />
        </LanguageWrapper>
      );
      expect(mockSphere.Map).toHaveBeenCalledWith(
        expect.objectContaining({ language: "en" })
      );
    });

    it("is the default locale of the services client", async () => {
      const fetchMock = vi.fn(async (_url: string) =>
        Response.json({ data: [] })
      );
      const { result } = renderHook(
        () => useSphereServices({ fetch: fetchMock as never }),
        { wrapper: LanguageWrapper }
      );
      await result.current.search.search("cafe");
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain("locale=en");
    });
  });

  describe("fallback", () => {
    it("shows the fallback until the map is ready", () => {
      render(
        <SphereProvider apiKey="test-key">
          <SphereMap fallback={<p>Loading map</p>}>
            <span>Map content</span>
          </SphereMap>
        </SphereProvider>
      );
      expect(screen.getByText("Loading map")).toBeInTheDocument();
      expect(screen.queryByText("Map content")).toBeNull();

      act(() => {
        mockMap._triggerReady();
      });
      expect(screen.queryByText("Loading map")).toBeNull();
      expect(screen.getByText("Map content")).toBeInTheDocument();
    });
  });

  describe("route destinations", () => {
    /** A Route whose destination list behaves like Sphere's. */
    function statefulRoute() {
      const stops: { location: () => Location; position: Location }[] = [];
      const stop = (position: Location) => {
        const marker = { location: () => marker.position, position };
        return marker;
      };
      map.Route = {
        add: vi.fn((position: Location) => stops.push(stop(position))),
        auto: vi.fn(),
        clear: vi.fn(() => stops.splice(0)),
        clearDestination: vi.fn(() => stops.splice(0)),
        clearPath: vi.fn(),
        guide: vi.fn().mockReturnValue([]),
        insert: vi.fn((index: number, position: Location) =>
          stops.splice(index, 0, stop(position))
        ),
        label: vi.fn().mockReturnValue("d"),
        language: vi.fn().mockReturnValue("en"),
        list: vi.fn(() => [...stops]),
        mode: vi.fn().mockReturnValue("t"),
        modeOf: vi.fn().mockReturnValue("t"),
        remove: vi.fn(),
        removeAt: vi.fn((index: number) => stops.splice(index, 1)),
        reverse: vi.fn(() => stops.reverse()),
        size: vi.fn(() => stops.length),
      };
      return stops;
    }

    it("keeps the destinations in state as they change", () => {
      const stops = statefulRoute();
      const { result } = renderHook(() => useRoute(), { wrapper });
      expect(result.current.destinations).toEqual([]);

      act(() => {
        result.current.addDestination(BANGKOK);
        result.current.addDestination({ lat: 14, lon: 101 });
      });
      expect(result.current.destinations).toEqual([
        BANGKOK,
        { lat: 14, lon: 101 },
      ]);

      act(() => {
        result.current.reverse();
      });
      expect(result.current.destinations[0]).toEqual({ lat: 14, lon: 101 });

      // A stop dragged on the map.
      const [dragged] = stops;
      if (dragged) {
        dragged.position = { lat: 15, lon: 102 };
      }
      act(() => {
        map.Event.fire("overlayDrop", dragged);
      });
      expect(result.current.destinations[0]).toEqual({ lat: 15, lon: 102 });

      act(() => {
        result.current.removeDestinationAt(0);
      });
      expect(result.current.destinations).toEqual([BANGKOK]);

      act(() => {
        result.current.clear();
      });
      expect(result.current.destinations).toEqual([]);
    });

    it("applies the auto option", () => {
      statefulRoute();
      const { rerender } = renderHook(
        ({ auto }: { auto: boolean }) => useRoute({ auto }),
        { initialProps: { auto: true }, wrapper }
      );
      expect(map.Route.auto).toHaveBeenLastCalledWith(true);
      rerender({ auto: false });
      expect(map.Route.auto).toHaveBeenLastCalledWith(false);
    });
  });

  describe("useSuggest", () => {
    it("suggests after a pause and ignores responses for older keywords", async () => {
      vi.useFakeTimers();
      const pending: { keyword: string; resolve: (value: unknown) => void }[] =
        [];
      map.Search = {
        suggest: vi.fn(
          (keyword: string) =>
            new Promise((resolve) => pending.push({ keyword, resolve }))
        ),
      };
      const { result, rerender } = renderHook(
        ({ keyword }: { keyword: string }) => useSuggest(keyword),
        { initialProps: { keyword: "ce" }, wrapper }
      );

      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(result.current.isLoading).toBe(true);
      rerender({ keyword: "cen" });
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(pending.map((request) => request.keyword)).toEqual(["ce", "cen"]);

      await act(async () => {
        pending[1]?.resolve({ data: [{ name: "Central World" }], meta: {} });
        await Promise.resolve();
      });
      await act(async () => {
        pending[0]?.resolve({ data: [{ name: "stale" }], meta: {} });
        await Promise.resolve();
      });
      expect(result.current.suggestions).toEqual([{ name: "Central World" }]);
      expect(result.current.isLoading).toBe(false);
    });

    it("waits for the minimum length and reports errors", async () => {
      vi.useFakeTimers();
      map.Search = { suggest: vi.fn().mockResolvedValue(null) };
      const { result, rerender } = renderHook(
        ({ keyword }: { keyword: string }) =>
          useSuggest(keyword, { debounce: 100, minLength: 3 }),
        { initialProps: { keyword: "ce" }, wrapper }
      );
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(map.Search.suggest).not.toHaveBeenCalled();

      rerender({ keyword: "cent" });
      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve();
      });
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe("marker clustering", () => {
    const near = [
      { id: "a", position: { lat: 13.75, lon: 100.5 } },
      { id: "b", position: { lat: 13.751, lon: 100.501 } },
      { id: "c", position: { lat: 13.752, lon: 100.499 } },
    ];
    const far = { id: "d", position: { lat: 18.79, lon: 98.98 } };
    const getPosition = (item: { position: Location }) => item.position;

    it("groups points that are close at the current zoom", () => {
      const { clusters, singles } = clusterPoints([...near, far], getPosition, {
        zoom: 8,
      });
      expect(clusters).toHaveLength(1);
      expect(clusters[0]?.count).toBe(3);
      expect(clusters[0]?.items.map((item) => item.id).sort()).toEqual([
        "a",
        "b",
        "c",
      ]);
      expect(clusters[0]?.bound).toEqual({
        maxLat: 13.752,
        maxLon: 100.501,
        minLat: 13.75,
        minLon: 100.499,
      });
      expect(clusters[0]?.position.lat).toBeCloseTo(13.751);
      expect(singles.map(({ item }) => item.id)).toEqual(["d"]);
    });

    it("grows a bounding box and tests locations against it", () => {
      const area = expandBound(VIEW.bound, 0.5);
      expect(area).toEqual({
        maxLat: 14.5,
        maxLon: 101.5,
        minLat: 12.5,
        minLon: 99.5,
      });
      expect(isInBound({ lat: 12.5, lon: 101.5 }, area)).toBe(true);
      expect(isInBound(far.position, area)).toBe(false);
    });

    it("stops clustering above maxZoom and below minPoints", () => {
      expect(
        clusterPoints(near, getPosition, { maxZoom: 16, zoom: 17 }).clusters
      ).toHaveLength(0);
      expect(
        clusterPoints(near, getPosition, { minPoints: 4, zoom: 8 }).clusters
      ).toHaveLength(0);
    });

    /** Renders a point that is not in a cluster. */
    const renderStation = (item: { id: string; position: Location }) => (
      <Marker key={item.id} position={item.position} title={item.id} />
    );

    it("renders clusters as markers and zooms in when one is clicked", () => {
      render(
        <SphereProvider apiKey="test-key">
          <SphereMap>
            <MarkerCluster
              getPosition={getPosition}
              items={[...near, far]}
              renderMarker={renderStation}
            />
          </SphereMap>
        </SphereProvider>
      );
      act(() => {
        mockMap._triggerReady();
      });

      // One cluster marker for the 3 points. The far point is out of view.
      expect(mockSphere.Marker).toHaveBeenCalledTimes(1);
      const [clusterMarker] = mockSphere.Marker.mock.results.map(
        (result) => result.value
      );
      act(() => {
        map.Event.fire("overlayClick", clusterMarker, BANGKOK);
      });
      expect(map.bound).toHaveBeenCalledWith(
        { maxLat: 13.752, maxLon: 100.501, minLat: 13.75, minLon: 100.499 },
        expect.objectContaining({ padding: expect.any(Number) })
      );
    });

    it("only renders markers in or near the visible area", () => {
      const defaultBound = map.bound.getMockImplementation();
      render(
        <SphereProvider apiKey="test-key">
          <SphereMap>
            <MarkerCluster
              getPosition={getPosition}
              items={[...near, far]}
              renderMarker={renderStation}
            />
          </SphereMap>
        </SphereProvider>
      );
      act(() => {
        mockMap._triggerReady();
      });
      expect(mockSphere.Marker).toHaveBeenCalledTimes(1);

      try {
        // Pan to Chiang Mai, where the far point is.
        map.bound.mockImplementation((value?: object) =>
          value === undefined
            ? { maxLat: 19.5, maxLon: 99.5, minLat: 18.5, minLon: 98.5 }
            : map
        );
        act(() => {
          map._fireRenderer("moveend");
        });
      } finally {
        map.bound.mockImplementation(defaultBound);
      }

      expect(mockSphere.Marker).toHaveBeenCalledTimes(2);
      expect(mockSphere.Marker).toHaveBeenLastCalledWith(
        far.position,
        expect.anything()
      );
      expect(map.Overlays.remove).toHaveBeenCalledTimes(1);
    });
  });
});
