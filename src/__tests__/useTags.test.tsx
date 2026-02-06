import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useSphereContext } from "../context/SphereContext";
import { TAG_CATEGORIES, useTags } from "../hooks/useTags";
import { createMockSphereApi } from "./setup";

describe("useTags", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();

    map.Tags = {
      set: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      list: vi.fn().mockReturnValue(["อาหารไทย", "ธนาคาร"]),
      size: vi.fn().mockReturnValue(2),
      enablePopup: vi.fn(),
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

  describe("tag operations", () => {
    it("delegates add to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.add("อาหารไทย");

      expect(map.Tags.add).toHaveBeenCalledWith("อาหารไทย", undefined);
    });

    it("delegates set to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.set("ธนาคาร", { source: "default" });

      expect(map.Tags.set).toHaveBeenCalledWith("ธนาคาร", {
        source: "default",
      });
    });

    it("delegates remove to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.remove("อาหารไทย");

      expect(map.Tags.remove).toHaveBeenCalledWith("อาหารไทย");
    });

    it("delegates clear to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.clear();

      expect(map.Tags.clear).toHaveBeenCalled();
    });
  });

  describe("tag queries", () => {
    it("returns list from Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.list()).toEqual(["อาหารไทย", "ธนาคาร"]);
    });

    it("returns size from Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.size()).toBe(2);
    });
  });

  describe("tag settings", () => {
    it("delegates enablePopup to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.enablePopup(true);

      expect(map.Tags.enablePopup).toHaveBeenCalledWith(true);
    });

    it("delegates setLanguage to Tags API", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      result.current.setLanguage("en");

      expect(map.Tags.language).toHaveBeenCalledWith("en");
    });
  });

  describe("TAG_CATEGORIES constant", () => {
    it("has Food & Dining category with Thai tag IDs", () => {
      const foodCategory = TAG_CATEGORIES.find(
        (c) => c.name === "Food & Dining"
      );
      expect(foodCategory).toBeDefined();
      expect(foodCategory?.tags[0]?.id).toBe("อาหารไทย");
    });

    it("has Services category", () => {
      const servicesCategory = TAG_CATEGORIES.find(
        (c) => c.name === "Services"
      );
      expect(servicesCategory).toBeDefined();
      expect(servicesCategory?.tags[0]?.id).toBe("ธนาคาร");
    });

    it("has Tourism category", () => {
      const tourismCategory = TAG_CATEGORIES.find((c) => c.name === "Tourism");
      expect(tourismCategory).toBeDefined();
    });
  });

  describe("when map is not ready", () => {
    function createNotReadyWrapper() {
      return function Wrapper({ children }: { children: ReactNode }) {
        return <SphereProvider apiKey="test-key">{children}</SphereProvider>;
      };
    }

    it("returns empty list when map is not ready", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createNotReadyWrapper(),
      });

      expect(result.current.list()).toEqual([]);
    });

    it("returns 0 size when map is not ready", () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createNotReadyWrapper(),
      });

      expect(result.current.size()).toBe(0);
    });
  });
});
