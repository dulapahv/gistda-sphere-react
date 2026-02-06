import { act, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereMap, type SphereMapRef } from "../components/SphereMap";
import { SphereProvider } from "../context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("SphereMap", () => {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  function renderMap(props = {}) {
    return render(
      <SphereProvider apiKey="test-key">
        <SphereMap data-testid="map" {...props} />
      </SphereProvider>
    );
  }

  describe("rendering", () => {
    it("renders a container div", async () => {
      renderMap();

      // The map should render a container
      await waitFor(() => {
        expect(mockSphere.Map).toHaveBeenCalled();
      });
    });

    it("creates a map with correct initial options", async () => {
      renderMap({
        zoom: 12,
        center: { lon: 100.5, lat: 13.75 },
        language: "en",
      });

      await waitFor(() => {
        expect(mockSphere.Map).toHaveBeenCalledWith(
          expect.objectContaining({
            zoom: 12,
            location: { lon: 100.5, lat: 13.75 },
            language: "en",
          })
        );
      });
    });

    it("renders children when map is ready", async () => {
      render(
        <SphereProvider apiKey="test-key">
          <SphereMap>
            <div data-testid="map-child">Map Content</div>
          </SphereMap>
        </SphereProvider>
      );

      // Trigger ready event
      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "ready",
          expect.any(Function)
        );
      });

      // Simulate ready event
      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(screen.getByTestId("map-child")).toBeInTheDocument();
      });
    });
  });

  describe("events", () => {
    it("binds ready event and calls onReady callback", async () => {
      const onReady = vi.fn();
      renderMap({ onReady });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "ready",
          expect.any(Function)
        );
      });

      // Simulate ready event
      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(onReady).toHaveBeenCalledWith(mockMap);
      });
    });

    it("binds click event and calls onClick callback", async () => {
      const onClick = vi.fn();
      renderMap({ onClick });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );
      });

      // Simulate click event
      const location = { lon: 100.5, lat: 13.75 };
      act(() => {
        mockMap._triggerClick(location);
      });

      expect(onClick).toHaveBeenCalledWith(location);
    });

    it("binds zoom event and calls onZoom callback", async () => {
      const onZoom = vi.fn();
      renderMap({ onZoom });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "zoom",
          expect.any(Function)
        );
      });

      // Simulate zoom event
      act(() => {
        mockMap._triggerZoom();
      });

      expect(onZoom).toHaveBeenCalled();
    });
  });

  describe("ref methods", () => {
    it("exposes getMap method", async () => {
      const ref = createRef<SphereMapRef>();

      render(
        <SphereProvider apiKey="test-key">
          <SphereMap ref={ref} />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(ref.current?.getMap()).toBe(mockMap);
      });
    });

    it("exposes setZoom method", async () => {
      const ref = createRef<SphereMapRef>();

      render(
        <SphereProvider apiKey="test-key">
          <SphereMap ref={ref} />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      act(() => {
        ref.current?.setZoom(15);
      });

      expect(mockMap.zoom).toHaveBeenCalledWith(15, true);
    });

    it("exposes setCenter method", async () => {
      const ref = createRef<SphereMapRef>();

      render(
        <SphereProvider apiKey="test-key">
          <SphereMap ref={ref} />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      const location = { lon: 101, lat: 14 };
      act(() => {
        ref.current?.setCenter(location);
      });

      expect(mockMap.location).toHaveBeenCalledWith(location, true);
    });

    it("exposes setRotate method", async () => {
      const ref = createRef<SphereMapRef>();

      render(
        <SphereProvider apiKey="test-key">
          <SphereMap ref={ref} />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      act(() => {
        ref.current?.setRotate(45);
      });

      expect(mockMap.rotate).toHaveBeenCalledWith(45, true);
    });

    it("exposes goTo method", async () => {
      const ref = createRef<SphereMapRef>();

      render(
        <SphereProvider apiKey="test-key">
          <SphereMap ref={ref} />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      const target = { center: { lon: 100, lat: 13 }, zoom: 12 };
      act(() => {
        ref.current?.goTo(target);
      });

      expect(mockMap.goTo).toHaveBeenCalledWith(target, true);
    });
  });
});
