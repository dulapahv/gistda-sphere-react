import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useSphereContext } from "../context/SphereContext";
import { useSearch } from "../hooks/useSearch";
import { createMockSphereApi } from "./setup";

describe("useSearch", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  /**
   * Registers the mock map in SphereContext so useMap() returns it.
   * useSearch reads from SphereContext.useMap, not MapContext.
   */
  function MapRegistrar({ map: mapInstance }: { map: any }) {
    const { registerMap } = useSphereContext();
    useEffect(() => {
      if (mapInstance) {
        registerMap(mapInstance);
      }
    }, [mapInstance, registerMap]);
    return null;
  }

  function createWrapper(mapReady = true) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <SphereProvider apiKey="test-key">
          {mapReady && <MapRegistrar map={map} />}
          {children}
        </SphereProvider>
      );
    };
  }

  describe("when Search API is not available", () => {
    it("throws when calling suggest without map", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(false),
      });

      await expect(result.current.suggest("coffee")).rejects.toThrow(
        "Search API not available"
      );
    });

    it("throws when calling search without map", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(false),
      });

      await expect(result.current.search("coffee")).rejects.toThrow(
        "Search API not available"
      );
    });

    it("throws when calling address without map", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(false),
      });

      await expect(
        result.current.address({ lon: 100.5, lat: 13.75 })
      ).rejects.toThrow("Search API not available");
    });

    it("throws when calling nearPoi without map", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(false),
      });

      await expect(
        result.current.nearPoi({ lon: 100.5, lat: 13.75 })
      ).rejects.toThrow("Search API not available");
    });
  });

  describe("when Search API is available", () => {
    beforeEach(() => {
      map.Search = {
        suggest: vi
          .fn()
          .mockResolvedValue({ data: [{ name: "Coffee A" }], total: 1 }),
        search: vi
          .fn()
          .mockResolvedValue({ data: [{ name: "Coffee B" }], total: 1 }),
        address: vi.fn().mockResolvedValue({
          address: "123 Street",
          province: "Bangkok",
        }),
        nearPoi: vi.fn().mockResolvedValue({
          data: [
            { id: "1", name: "Coffee C", location: { lon: 100.5, lat: 13.75 } },
          ],
        }),
        clear: vi.fn(),
        enablePopup: vi.fn(),
        language: vi.fn(),
      };
    });

    it("calls suggest with keyword and options", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      const searchResult = await result.current.suggest("coffee", { limit: 5 });

      expect(map.Search.suggest).toHaveBeenCalledWith("coffee", {
        limit: 5,
      });
      expect(searchResult).toEqual({ data: [{ name: "Coffee A" }], total: 1 });
    });

    it("calls search with keyword and options", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      const searchResult = await result.current.search("coffee", { limit: 10 });

      expect(map.Search.search).toHaveBeenCalledWith("coffee", {
        limit: 10,
      });
      expect(searchResult).toEqual({ data: [{ name: "Coffee B" }], total: 1 });
    });

    it("calls address with location", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      const addressResult = await result.current.address({
        lon: 100.5,
        lat: 13.75,
      });

      expect(map.Search.address).toHaveBeenCalledWith(
        { lon: 100.5, lat: 13.75 },
        undefined
      );
      expect(addressResult).toEqual({
        address: "123 Street",
        province: "Bangkok",
      });
    });

    it("calls nearPoi with location and options", async () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      const pois = await result.current.nearPoi(
        { lon: 100.5, lat: 13.75 },
        { limit: 5 }
      );

      expect(map.Search.nearPoi).toHaveBeenCalledWith(
        { lon: 100.5, lat: 13.75 },
        { limit: 5 }
      );
      expect(pois).toEqual([
        { id: "1", name: "Coffee C", location: { lon: 100.5, lat: 13.75 } },
      ]);
    });

    it("delegates clear to Search API", () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      result.current.clear();

      expect(map.Search.clear).toHaveBeenCalled();
    });

    it("delegates enablePopup to Search API", () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      result.current.enablePopup(true);

      expect(map.Search.enablePopup).toHaveBeenCalledWith(true);
    });

    it("delegates setLanguage to Search API", () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: createWrapper(),
      });

      result.current.setLanguage("en");

      expect(map.Search.language).toHaveBeenCalledWith("en");
    });
  });
});
