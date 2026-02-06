import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Layer } from "../components/Layer";
import { SphereMap } from "../components/SphereMap";
import { SphereProvider } from "../context/SphereContext";
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
      renderLayer({ preset: "HYBRID", isBase: true });

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
        type: "WMS",
        url: "https://example.com/wms",
        opacity: 0.7,
      });

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Layer).toHaveBeenCalledWith(
          "my-wms-layer",
          expect.objectContaining({
            type: "WMS",
            url: "https://example.com/wms",
            opacity: 0.7,
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

    it("does not remove base layer on unmount", async () => {
      const { unmount } = renderLayer({ preset: "HYBRID", isBase: true });

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
