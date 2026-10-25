import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Layer } from "@/components/Layer";
import { SphereMap } from "@/components/SphereMap";
import { SphereProvider } from "@/context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("Layer", () => {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  function renderLayer(layerProps = {}) {
    return render(
      <SphereProvider apiKey="test-key">
        <SphereMap>
          <Layer {...layerProps} />
        </SphereMap>
      </SphereProvider>
    );
  }

  describe("preset layers", () => {
    it("adds a built-in layer to the map", async () => {
      renderLayer({ preset: "TRAFFIC" });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Layers.add).toHaveBeenCalledWith(
          mockSphere.Layers.TRAFFIC,
          undefined
        );
      });
    });

    it("sets built-in layer as base when isBase is true", async () => {
      renderLayer({ isBase: true, preset: "HYBRID" });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Layers.setBase).toHaveBeenCalledWith(
          mockSphere.Layers.HYBRID
        );
      });
    });
  });

  describe("custom layers", () => {
    it("creates a custom layer with name and options", async () => {
      renderLayer({
        name: "my-wms-layer",
        opacity: 0.7,
        type: "WMS",
        url: "https://example.com/wms",
      });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Layer).toHaveBeenCalledWith(
          "my-wms-layer",
          expect.objectContaining({
            opacity: 0.7,
            type: "WMS",
            url: "https://example.com/wms",
          })
        );
      });
    });
  });

  describe("cleanup", () => {
    it("removes non-base layer on unmount", async () => {
      const { unmount } = renderLayer({ preset: "TRAFFIC" });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Layers.add).toHaveBeenCalled();
      });

      unmount();

      expect(mockMap.Layers.remove).toHaveBeenCalled();
    });

    it("removes a layer unmounted while its style loads once Sphere adds it", async () => {
      // Sphere adds style-URL layers only after fetching the style.
      mockMap.Layers.add.mockImplementationOnce(() => mockMap.Layers);
      const { unmount } = renderLayer({
        style: "https://example.com/style.json",
      });

      act(() => {
        mockMap._triggerReady();
      });
      await waitFor(() => {
        expect(mockMap.Layers.add).toHaveBeenCalled();
      });
      const layer = mockMap.Layers.add.mock.calls[0]?.[0];

      unmount();
      expect(mockMap.Layers.remove).not.toHaveBeenCalled();

      act(() => {
        mockMap.Event.fire("layerChange", layer);
      });
      await waitFor(() => {
        expect(mockMap.Layers.remove).toHaveBeenCalledWith(layer);
      });
    });

    it("does not remove base layer on unmount", async () => {
      const { unmount } = renderLayer({ isBase: true, preset: "HYBRID" });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Layers.setBase).toHaveBeenCalled();
      });

      unmount();

      // Base layers should not be removed on unmount
      expect(mockMap.Layers.remove).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("does nothing without preset or name", async () => {
      renderLayer({});

      act(() => {
        mockMap._triggerReady();
      });

      await new Promise((r) => setTimeout(r, 50));
      expect(mockMap.Layers.add).not.toHaveBeenCalled();
      expect(mockMap.Layers.setBase).not.toHaveBeenCalled();
      expect(mockSphere.Layer).not.toHaveBeenCalled();
    });
  });
});
