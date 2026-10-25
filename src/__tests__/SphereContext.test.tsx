import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type SphereContextValue,
  SphereProvider,
  useSphereContext,
} from "@/context/SphereContext";
import type { SphereMap } from "@/types";
import { createMockSphereApi } from "./setup";

describe("SphereContext", () => {
  const { mockSphere } = createMockSphereApi();

  beforeEach(() => {
    // Reset window.sphere
    window.sphere = undefined;
    vi.clearAllMocks();
  });

  describe("SphereProvider", () => {
    it("renders children", () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;

      render(
        <SphereProvider apiKey="test-key">
          <div data-testid="child">Child Content</div>
        </SphereProvider>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("provides isLoaded=true when sphere API is available", async () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;

      function TestComponent() {
        const { isLoaded } = useSphereContext();
        return (
          <div data-testid="loaded">{isLoaded ? "loaded" : "loading"}</div>
        );
      }

      render(
        <SphereProvider apiKey="test-key">
          <TestComponent />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loaded")).toHaveTextContent("loaded");
      });
    });

    it("provides the sphere namespace", async () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;

      function TestComponent() {
        const { sphere } = useSphereContext();
        return (
          <div data-testid="sphere">{sphere ? "has-sphere" : "no-sphere"}</div>
        );
      }

      render(
        <SphereProvider apiKey="test-key">
          <TestComponent />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("sphere")).toHaveTextContent("has-sphere");
      });
    });

    it("provides the API key", () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;

      function TestComponent() {
        const { apiKey } = useSphereContext();
        return <div data-testid="key">{apiKey}</div>;
      }

      render(
        <SphereProvider apiKey="my-api-key">
          <TestComponent />
        </SphereProvider>
      );

      expect(screen.getByTestId("key")).toHaveTextContent("my-api-key");
    });

    it("calls onLoad callback when script loads", async () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;
      const onLoad = vi.fn();

      render(
        <SphereProvider apiKey="test-key" onLoad={onLoad}>
          <div>Content</div>
        </SphereProvider>
      );

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });

    it("calls an inline onLoad once, however often the provider re-renders", async () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;
      const onLoad = vi.fn();
      const view = () => {
        // A new function on every render, like an inline callback.
        const handleLoad = () => onLoad();
        return (
          <SphereProvider apiKey="test-key" onLoad={handleLoad}>
            <div>Content</div>
          </SphereProvider>
        );
      };

      const { rerender } = render(view());
      await waitFor(() => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      });
      rerender(view());
      rerender(view());

      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it("falls back to the previous ready map when the active one goes away", () => {
      // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
      window.sphere = mockSphere;
      const first = { name: "first" } as unknown as SphereMap;
      const second = { name: "second" } as unknown as SphereMap;
      const probe: { current: SphereContextValue | null } = { current: null };
      function Probe() {
        probe.current = useSphereContext();
        return null;
      }
      render(
        <SphereProvider apiKey="test-key">
          <Probe />
        </SphereProvider>
      );

      act(() => {
        probe.current?.registerMap(first);
        probe.current?.registerMap(second);
      });
      expect(probe.current?.map).toBe(second);

      // A map that is not the active one leaves the active map alone.
      act(() => {
        probe.current?.unregisterMap(first);
        probe.current?.registerMap(first);
      });
      expect(probe.current?.map).toBe(first);

      act(() => {
        probe.current?.unregisterMap(first);
      });
      expect(probe.current?.map).toBe(second);
      expect(probe.current?.isMapReady).toBe(true);

      act(() => {
        probe.current?.unregisterMap();
      });
      expect(probe.current?.map).toBeNull();
      expect(probe.current?.isMapReady).toBe(false);
    });
  });

  describe("useSphereContext", () => {
    it("throws error when used outside provider", () => {
      function TestComponent() {
        useSphereContext();
        return null;
      }

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useSphereContext must be used within a SphereProvider");
    });
  });
});
