import { act, render } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Marker } from "@/components/Marker";
import {
  SphereMap,
  type SphereMapProps,
  type SphereMapRef,
} from "@/components/SphereMap";
import { SphereProvider } from "@/context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("SphereMap features", () => {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  function mount(props: SphereMapProps = {}) {
    const view = (next: SphereMapProps) => (
      <SphereProvider apiKey="test-key">
        <SphereMap {...next} />
      </SphereProvider>
    );
    const utils = render(view(props));
    act(() => {
      mockMap._triggerReady();
    });
    return {
      ...utils,
      update: (next: SphereMapProps) => utils.rerender(view(next)),
    };
  }

  it("forwards events with Sphere's arguments", () => {
    const handlers = {
      onBeforeContextMenu: vi.fn().mockReturnValue(false),
      onLayerChange: vi.fn(),
      onOverlayClick: vi.fn(),
      onRouteComplete: vi.fn(),
      onTileLoaded: vi.fn(),
      onToolbarChange: vi.fn(),
      onWheel: vi.fn(),
    };
    mount(handlers);
    const overlay = {};
    const location = { lat: 1, lon: 2 };

    let menuAllowed = true;
    act(() => {
      mockMap.Event.fire("overlayClick", overlay, location);
      mockMap.Event.fire("layerChange", undefined, { id: "x" });
      mockMap.Event.fire("toolbarChange", "draw_polygon");
      mockMap.Event.fire("tileLoaded", "base");
      mockMap.Event.fire("wheel", { delta: 120, x: 1, y: 2 });
      mockMap.Event.fire("routeComplete", []);
      menuAllowed = mockMap.Event.fire("beforeContextmenu", {
        add: vi.fn(),
        location,
      });
    });

    expect(handlers.onOverlayClick).toHaveBeenCalledWith(overlay, location);
    expect(handlers.onLayerChange).toHaveBeenCalledWith(undefined, { id: "x" });
    expect(handlers.onToolbarChange).toHaveBeenCalledWith("draw_polygon");
    expect(handlers.onTileLoaded).toHaveBeenCalledWith("base");
    expect(handlers.onWheel).toHaveBeenCalledWith({ delta: 120, x: 1, y: 2 });
    expect(handlers.onRouteComplete).toHaveBeenCalledWith([]);
    // Returning false from onBeforeContextMenu cancels the menu.
    expect(menuAllowed).toBe(false);
  });

  it("passes current values to zoom, location, rotate and pitch callbacks", () => {
    const onZoom = vi.fn();
    const onLocation = vi.fn();
    const onRotate = vi.fn();
    const onPitch = vi.fn();
    mount({ onLocation, onPitch, onRotate, onZoom });

    act(() => {
      mockMap.Event.fire("zoom");
      mockMap.Event.fire("location");
      mockMap.Event.fire("rotate");
      mockMap.Event.fire("pitch");
    });

    expect(onZoom).toHaveBeenCalledWith(10);
    expect(onLocation).toHaveBeenCalledWith({ lat: 13.75, lon: 100.5 });
    expect(onRotate).toHaveBeenCalledWith(0);
    expect(onPitch).toHaveBeenCalledWith(0);
  });

  it("normalizes errors", () => {
    const onError = vi.fn();
    mount({ onError });
    act(() => {
      mockMap.Event.fire("error", { message: "tile failed" });
    });
    expect(onError).toHaveBeenCalledWith(new Error("tile failed"));
  });

  it("maps the ui mode, including None", () => {
    mount({ ui: "None" });
    expect(mockSphere.Map).toHaveBeenCalledWith(
      expect.objectContaining({ ui: false })
    );
  });

  it("passes extra map options through", () => {
    mount({ options: { maxPitch: 45 } });
    expect(mockSphere.Map).toHaveBeenCalledWith(
      expect.objectContaining({ maxPitch: 45 })
    );
  });

  it("disables interaction for input={false} (Sphere ignores input alone)", () => {
    mount({ input: false });
    expect(mockSphere.Map).toHaveBeenCalledWith(
      expect.objectContaining({ input: false, interactive: false })
    );
  });

  it("leaves interaction alone by default and respects explicit options", () => {
    mount();
    expect(mockSphere.Map.mock.calls.at(-1)?.[0]).not.toHaveProperty(
      "interactive"
    );
    mount({ input: false, options: { interactive: true } });
    expect(mockSphere.Map).toHaveBeenLastCalledWith(
      expect.objectContaining({ interactive: true })
    );
  });

  it("sets the initial base layer and swaps it when the prop changes", () => {
    const { update } = mount({ baseLayer: "HYBRID" });
    expect(mockSphere.Map).toHaveBeenCalledWith(
      expect.objectContaining({ layer: mockSphere.Layers.HYBRID })
    );
    expect(mockMap.Layers.setBase).not.toHaveBeenCalled();

    update({ baseLayer: "STREETS_NIGHT" });
    expect(mockMap.Layers.setBase).toHaveBeenCalledWith(
      mockSphere.Layers.STREETS_NIGHT
    );
  });

  it("wraps style URLs for the initial base layer", () => {
    mount({ baseLayer: "https://example.com/style.json" });
    expect(mockSphere.Layer).toHaveBeenCalledWith(
      "https://example.com/style.json"
    );
  });

  it("applies control visibility on ready and on change", () => {
    const { update } = mount({ controls: { DPad: false } });
    expect(mockMap.Ui.DPad.visible).toHaveBeenCalledWith(false);

    update({ controls: { DPad: false, Scale: false } });
    expect(mockMap.Ui.Scale.visible).toHaveBeenCalledWith(false);
  });

  it("updates language, filter and zoom range in place", () => {
    const { update } = mount({
      language: "th",
      zoomRange: { max: 18, min: 5 },
    });
    expect(mockMap.zoomRange).not.toHaveBeenCalled();

    update({ filter: "Dark", language: "en", zoomRange: { max: 16, min: 5 } });

    expect(mockSphere.Map).toHaveBeenCalledTimes(1);
    expect(mockMap.language).toHaveBeenCalledWith("en");
    expect(mockMap.enableFilter).toHaveBeenCalledWith("DARK");
    expect(mockMap.zoomRange).toHaveBeenCalledWith({ max: 16, min: 5 });
  });

  it("clears the filter when the prop is removed, and only then", () => {
    const { update } = mount({ filter: "Dark" });
    expect(mockMap.enableFilter).toHaveBeenLastCalledWith("DARK");

    update({});
    expect(mockMap.enableFilter).toHaveBeenLastCalledWith(false);

    mockMap.enableFilter.mockClear();
    update({ language: "en" });
    expect(mockMap.enableFilter).not.toHaveBeenCalled();
  });

  it("frees the renderer on unmount", async () => {
    const { unmount } = mount();
    unmount();
    await Promise.resolve();
    expect(mockMap.Renderer.remove).toHaveBeenCalled();
  });

  it("gives each map its own element, so a discarded map can't break the next", async () => {
    // StrictMode mounts effects twice: the first map is discarded while the
    // second is created. Removing the first must not touch the second's
    // element (MapLibre strips its classes, and Sphere leaves elements behind).
    const view = render(
      <StrictMode>
        <SphereProvider apiKey="test-key">
          <div />
        </SphereProvider>
      </StrictMode>
    );
    await act(async () => {
      await Promise.resolve();
    });
    view.rerender(
      <StrictMode>
        <SphereProvider apiKey="test-key">
          <SphereMap style={{ height: 300 }} />
        </SphereProvider>
      </StrictMode>
    );
    await act(async () => {
      await Promise.resolve();
    });

    const placeholders = mockSphere.Map.mock.calls.map(
      ([options]) => (options as { placeholder: HTMLElement }).placeholder
    );
    expect(placeholders).toHaveLength(2);
    expect(placeholders[0]).not.toBe(placeholders[1]);
    expect(placeholders[0]?.isConnected).toBe(false);
    expect(placeholders[1]?.isConnected).toBe(true);
    expect(mockMap.Renderer.remove).toHaveBeenCalledTimes(1);
  });

  it("frees the renderer only after its overlays removed themselves", async () => {
    // React unmounts parents first, and Sphere's overlays break (deck.gl throws)
    // when removed from a map whose renderer is already gone.
    const calls: string[] = [];
    const removeRenderer = mockMap.Renderer.remove;
    if (!removeRenderer) {
      throw new Error("The mock renderer has no remove()");
    }
    mockMap.Overlays.remove.mockImplementation(() => {
      calls.push("overlay");
      return mockMap.Overlays;
    });
    removeRenderer.mockImplementation(() => {
      calls.push("renderer");
    });
    try {
      const view = render(
        <SphereProvider apiKey="test-key">
          <SphereMap>
            <Marker position={{ lat: 13.75, lon: 100.5 }} />
          </SphereMap>
        </SphereProvider>
      );
      act(() => {
        mockMap._triggerReady();
      });

      view.unmount();
      await Promise.resolve();

      expect(calls).toEqual(["overlay", "renderer"]);
    } finally {
      mockMap.Overlays.remove.mockReturnThis();
      removeRenderer.mockImplementation(() => undefined);
    }
  });

  it("exposes map controls on its ref", () => {
    const ref = createRef<SphereMapRef>();
    mount({ ref });

    ref.current?.zoomIn();
    ref.current?.zoomOut(false);
    ref.current?.panBy({ x: 10, y: 0 });
    ref.current?.setFilter("Protanopia");

    expect(mockMap.zoom).toHaveBeenCalledWith(true, true);
    expect(mockMap.zoom).toHaveBeenCalledWith(false, false);
    expect(mockMap.move).toHaveBeenCalledWith({ x: 10, y: 0 }, true);
    expect(mockMap.enableFilter).toHaveBeenCalledWith("PROTANOPIA");
    expect(ref.current?.getZoom()).toBe(10);
    expect(ref.current?.getMap()).toBe(mockMap);
  });
});
