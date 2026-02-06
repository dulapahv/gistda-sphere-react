import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Marker } from "../components/Marker";
import { SphereMap } from "../components/SphereMap";
import { SphereProvider } from "../context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("Marker", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  let mockMarkerInstance: ReturnType<typeof mockSphere.Marker>;

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    mockMarkerInstance = mockSphere.Marker();
    mockSphere.Marker.mockImplementation(function () {
      return mockMarkerInstance;
    });
    vi.clearAllMocks();
  });

  function renderMarker(markerProps = {}) {
    return render(
      <SphereProvider apiKey="test-key">
        <SphereMap>
          <Marker position={{ lon: 100.5, lat: 13.75 }} {...markerProps} />
        </SphereMap>
      </SphereProvider>
    );
  }

  describe("creation", () => {
    it("creates a marker with position", async () => {
      renderMarker();

      // Trigger map ready
      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Marker).toHaveBeenCalledWith(
          { lon: 100.5, lat: 13.75 },
          expect.any(Object)
        );
      });
    });

    it("creates a marker with title and detail", async () => {
      renderMarker({ title: "Test Marker", detail: "Test Detail" });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Marker).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            title: "Test Marker",
            detail: "Test Detail",
          })
        );
      });
    });

    it("creates a draggable marker", async () => {
      renderMarker({ draggable: true });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Marker).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            draggable: true,
          })
        );
      });
    });

    it("creates a marker with custom icon", async () => {
      const icon = { url: "https://example.com/icon.png" };
      renderMarker({ icon });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Marker).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            icon,
          })
        );
      });
    });
  });

  describe("overlay management", () => {
    it("adds marker to map overlays", async () => {
      renderMarker();

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockMarkerInstance);
      });
    });

    it("removes marker from map overlays on unmount", async () => {
      const { unmount } = renderMarker();

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalled();
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(mockMarkerInstance);
    });
  });

  describe("events", () => {
    it("binds overlayClick event", async () => {
      const onClick = vi.fn();
      renderMarker({ onClick });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayClick",
          expect.any(Function)
        );
      });
    });

    it("binds overlayDrop event when draggable", async () => {
      const onDrop = vi.fn();
      renderMarker({ draggable: true, onDrop });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayDrop",
          expect.any(Function)
        );
      });
    });

    it("unbinds events on unmount", async () => {
      const { unmount } = renderMarker({ onClick: vi.fn() });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalled();
      });

      unmount();

      expect(mockMap.Event.unbind).toHaveBeenCalledWith(
        "overlayClick",
        expect.any(Function)
      );
    });
  });
});
