import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MapProvider } from "../context/MapContext";
import { SphereProvider } from "../context/SphereContext";
import { useMapClick, useMapEvent, useMapZoom } from "../hooks/useMapEvent";
import { useSphere } from "../hooks/useSphere";
import { createMockSphereApi } from "./setup";

describe("Hooks", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  describe("useSphere", () => {
    function createWrapper() {
      return function Wrapper({ children }: { children: ReactNode }) {
        return <SphereProvider apiKey="test-key">{children}</SphereProvider>;
      };
    }

    it("returns sphere namespace when loaded", async () => {
      const { result } = renderHook(() => useSphere(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sphere).toBe(mockSphere);
      });
    });

    it("returns isLoaded true when sphere is available", async () => {
      const { result } = renderHook(() => useSphere(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it("returns error as null when no errors", async () => {
      const { result } = renderHook(() => useSphere(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("useMapEvent", () => {
    function createWrapper() {
      return function Wrapper({ children }: { children: ReactNode }) {
        return (
          <SphereProvider apiKey="test-key">
            <MapProvider isReady={true} map={map}>
              {children}
            </MapProvider>
          </SphereProvider>
        );
      };
    }

    it("binds event handler to map", () => {
      const handler = vi.fn();

      renderHook(() => useMapEvent("click", handler), {
        wrapper: createWrapper(),
      });

      expect(mockMap.Event.bind).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("unbinds event handler on unmount", () => {
      const handler = vi.fn();

      const { unmount } = renderHook(() => useMapEvent("click", handler), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockMap.Event.unbind).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("calls handler when event is triggered", () => {
      const handler = vi.fn();

      renderHook(() => useMapEvent("click", handler), {
        wrapper: createWrapper(),
      });

      // Get the bound handler and call it
      const boundHandler = mockMap.Event.bind.mock.calls.find(
        (call) => call[0] === "click"
      )?.[1];

      const eventData = { lon: 100.5, lat: 13.75 };
      act(() => {
        boundHandler?.(eventData);
      });

      expect(handler).toHaveBeenCalledWith(eventData);
    });
  });

  describe("useMapClick", () => {
    function createWrapper() {
      return function Wrapper({ children }: { children: ReactNode }) {
        return (
          <SphereProvider apiKey="test-key">
            <MapProvider isReady={true} map={map}>
              {children}
            </MapProvider>
          </SphereProvider>
        );
      };
    }

    it("binds click event", () => {
      const handler = vi.fn();

      renderHook(() => useMapClick(handler), {
        wrapper: createWrapper(),
      });

      expect(mockMap.Event.bind).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });
  });

  describe("useMapZoom", () => {
    function createWrapper() {
      return function Wrapper({ children }: { children: ReactNode }) {
        return (
          <SphereProvider apiKey="test-key">
            <MapProvider isReady={true} map={map}>
              {children}
            </MapProvider>
          </SphereProvider>
        );
      };
    }

    it("binds zoom event", () => {
      const handler = vi.fn();

      renderHook(() => useMapZoom(handler), {
        wrapper: createWrapper(),
      });

      expect(mockMap.Event.bind).toHaveBeenCalledWith(
        "zoom",
        expect.any(Function)
      );
    });
  });
});
