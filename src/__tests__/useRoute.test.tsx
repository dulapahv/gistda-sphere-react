import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useSphereContext } from "../context/SphereContext";
import { useRoute } from "../hooks/useRoute";
import { createMockSphereApi } from "./setup";

describe("useRoute", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock
    window.sphere = mockSphere;
    vi.clearAllMocks();

    map.Route = {
      add: vi.fn(),
      insert: vi.fn(),
      remove: vi.fn(),
      removeAt: vi.fn(),
      clearDestination: vi.fn(),
      clearPath: vi.fn(),
      clear: vi.fn(),
      reverse: vi.fn(),
      search: vi.fn(),
      distance: vi.fn().mockReturnValue(450),
      interval: vi.fn().mockReturnValue(19_800),
      guide: vi.fn().mockReturnValue([]),
      exportRouteLine: vi.fn().mockReturnValue(null),
      list: vi.fn().mockReturnValue([]),
      size: vi.fn().mockReturnValue(0),
      mode: vi.fn(),
      modeOf: vi.fn(),
      enableRoute: vi.fn(),
      label: vi.fn(),
      auto: vi.fn(),
      language: vi.fn(),
    };
  });

  function MapRegistrar({ mapInstance }: { mapInstance: any }) {
    const { registerMap } = useSphereContext();
    useEffect(() => {
      registerMap(mapInstance);
    }, [mapInstance, registerMap]);
    return null;
  }

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <SphereProvider apiKey="test-key">
          <MapRegistrar mapInstance={map} />
          {children}
        </SphereProvider>
      );
    };
  }

  describe("destination management", () => {
    it("delegates addDestination to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      const location = { lon: 100.5, lat: 13.75 };
      result.current.addDestination(location);

      expect(map.Route.add).toHaveBeenCalledWith(location, undefined);
    });

    it("delegates insertDestination to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      const location = { lon: 100.5, lat: 13.75 };
      result.current.insertDestination(1, location, "Traffic");

      expect(map.Route.insert).toHaveBeenCalledWith(1, location, "Traffic");
    });

    it("delegates removeDestinationAt to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.removeDestinationAt(0);

      expect(map.Route.removeAt).toHaveBeenCalledWith(0);
    });

    it("delegates clearDestinations to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.clearDestinations();

      expect(map.Route.clearDestination).toHaveBeenCalled();
    });
  });

  describe("route operations", () => {
    it("delegates search to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.search();

      expect(map.Route.search).toHaveBeenCalled();
    });

    it("delegates clear to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.clear();

      expect(map.Route.clear).toHaveBeenCalled();
    });

    it("delegates reverse to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.reverse();

      expect(map.Route.reverse).toHaveBeenCalled();
    });
  });

  describe("route info", () => {
    it("returns distance from Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getDistance()).toBe(450);
      expect(map.Route.distance).toHaveBeenCalledWith(false);
    });

    it("returns formatted distance from Route API", () => {
      map.Route.distance.mockReturnValue("450 km");

      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getDistance(true)).toBe("450 km");
      expect(map.Route.distance).toHaveBeenCalledWith(true);
    });

    it("returns interval from Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getInterval()).toBe(19_800);
      expect(map.Route.interval).toHaveBeenCalledWith(false);
    });

    it("returns guide from Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getGuide()).toEqual([]);
      expect(map.Route.guide).toHaveBeenCalledWith(false);
    });
  });

  describe("route settings", () => {
    it("delegates setMode to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.setMode("Traffic");

      expect(map.Route.mode).toHaveBeenCalledWith("Traffic");
    });

    it("delegates setLabel to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.setLabel("Distance");

      expect(map.Route.label).toHaveBeenCalledWith("Distance");
    });

    it("delegates setLanguage to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.setLanguage("en");

      expect(map.Route.language).toHaveBeenCalledWith("en");
    });

    it("delegates setAuto to Route API", () => {
      const { result } = renderHook(() => useRoute(), {
        wrapper: createWrapper(),
      });

      result.current.setAuto(true);

      expect(map.Route.auto).toHaveBeenCalledWith(true);
    });
  });
});
