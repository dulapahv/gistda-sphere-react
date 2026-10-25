import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeoJson, type GeoJsonRef } from "@/components/GeoJson";
import { MapControl } from "@/components/MapControl";
import { MenuBar } from "@/components/MenuBar";
import { ObjectOverlay } from "@/components/ObjectOverlay";
import { PredefinedOverlay } from "@/components/PredefinedOverlay";
import { RouteGuide } from "@/components/RouteGuide";
import { SearchResults } from "@/components/SearchResults";
import { Tag } from "@/components/Tag";
import { MapProvider } from "@/context/MapContext";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@/types";
import { createProviderWrapper, renderInMap } from "./helpers";
import { createMockSphereApi } from "./setup";

const OBJECT_NOT_LOADED = /"A99999999" did not load/;

/** Marker options built from a feature's `name` property. */
function titleFromName(feature: GeoJSONFeature) {
  return { title: String(feature.properties?.name) };
}

describe("new components", () => {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  describe("GeoJson", () => {
    const data: GeoJSONFeatureCollection = {
      features: [
        {
          geometry: { coordinates: [100.5, 13.75], type: "Point" },
          properties: { name: "A" },
          type: "Feature",
        },
        {
          geometry: {
            coordinates: [
              [100, 13],
              [101, 14],
            ],
            type: "LineString",
          },
          properties: { name: "B" },
          type: "Feature",
        },
        {
          geometry: {
            coordinates: [
              [
                [100, 13],
                [101, 13],
                [101, 14],
                [100, 13],
              ],
            ],
            type: "Polygon",
          },
          properties: { name: "C" },
          type: "Feature",
        },
        {
          geometry: {
            coordinates: [
              [100, 13],
              [102, 15],
            ],
            type: "MultiPoint",
          },
          properties: { name: "D" },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    };

    it("creates an overlay per geometry without mutating the input", () => {
      const snapshot = JSON.stringify(data);
      renderInMap(
        mockMap,
        <GeoJson
          data={data}
          markerOptions={titleFromName}
          style={{ lineStyle: "Dashed" }}
        />
      );

      expect(mockSphere.Marker).toHaveBeenCalledTimes(3);
      expect(mockSphere.Polyline).toHaveBeenCalledTimes(1);
      expect(mockSphere.Polygon).toHaveBeenCalledTimes(1);
      expect(mockSphere.Marker.mock.calls[0]?.[1]).toEqual({ title: "A" });
      expect(mockSphere.Polyline.mock.calls[0]?.[1]).toEqual({
        lineStyle: [6, 4],
      });
      expect(mockMap.Overlays.add).toHaveBeenCalledTimes(5);
      expect(JSON.stringify(data)).toBe(snapshot);
    });

    it("renders points as dots when asked", () => {
      renderInMap(
        mockMap,
        <GeoJson data={data.features[0] as never} pointType="dot" />
      );
      expect(mockSphere.Dot).toHaveBeenCalledTimes(1);
      expect(mockSphere.Marker).not.toHaveBeenCalled();
    });

    it("maps clicks back to features and fits bounds", () => {
      const onClick = vi.fn();
      const ref = createRef<GeoJsonRef>();
      renderInMap(
        mockMap,
        <GeoJson data={data} fitBounds onClick={onClick} ref={ref} />
      );
      const line = mockSphere.Polyline.mock.results[0]?.value;
      act(() => {
        mockMap.Event.fire("overlayClick", line, { lat: 13, lon: 100 });
      });

      expect(onClick).toHaveBeenCalledWith(data.features[1], line, {
        lat: 13,
        lon: 100,
      });
      expect(mockMap.bound).toHaveBeenCalledWith(
        { maxLat: 15, maxLon: 102, minLat: 13, minLon: 100 },
        { padding: 40 }
      );
      expect(ref.current?.getOverlays()).toHaveLength(5);
    });

    it("removes its overlays on unmount", () => {
      const { unmount } = renderInMap(mockMap, <GeoJson data={data} />);
      unmount();
      expect(mockMap.Overlays.remove).toHaveBeenCalledTimes(5);
    });
  });

  describe("ObjectOverlay", () => {
    it("loads an object with converted options and reports when it loads", () => {
      const onLoad = vi.fn();
      const object = {
        items: [] as unknown[],
        overlays: [] as unknown[],
        popup: true,
        url: "",
      };
      mockSphere.Overlays.Object = vi.fn().mockImplementation(function () {
        return object;
      });

      const { unmount } = renderInMap(
        mockMap,
        <ObjectOverlay
          fitBounds
          id="A10000000"
          label
          lineStyle="Dot"
          onLoad={onLoad}
        />
      );

      expect(mockSphere.Overlays.Object).toHaveBeenCalledWith(
        "A10000000",
        undefined,
        expect.objectContaining({
          label: mockSphere.ObjectLabel.Title,
          lineStyle: [2, 2],
        })
      );
      expect(mockMap.Overlays.load).toHaveBeenCalledWith(object);

      const polygon = mockSphere.Polygon();
      const data = { id: "A10000000" };
      object.items = [data];
      object.overlays = [polygon];
      act(() => {
        mockMap.Event.fire("overlayLoad", { other: true });
        mockMap.Event.fire("overlayLoad", data);
      });

      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(onLoad).toHaveBeenCalledWith(data, [polygon]);
      expect(mockMap.bound).toHaveBeenCalled();

      unmount();
      expect(mockMap.Overlays.unload).toHaveBeenCalledWith(object);
    });

    it("reports an object that never loads", () => {
      vi.useFakeTimers();
      try {
        const onError = vi.fn();
        const object = { items: [], overlays: [], popup: true, url: "" };
        mockSphere.Overlays.Object = vi.fn().mockImplementation(function () {
          return object;
        });
        renderInMap(
          mockMap,
          <ObjectOverlay id="A99999999" onError={onError} timeout={500} />
        );
        act(() => {
          vi.advanceTimersByTime(499);
        });
        expect(onError).not.toHaveBeenCalled();
        act(() => {
          vi.advanceTimersByTime(1);
        });
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(OBJECT_NOT_LOADED),
          })
        );
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("PredefinedOverlay", () => {
    it("configures, loads and unloads a live overlay", () => {
      const { unmount } = renderInMap(
        mockMap,
        <PredefinedOverlay motion={false} popup={false} type="cameras" />
      );
      const config = mockSphere.Overlays.cameras as Record<string, unknown>;
      expect(config.popup).toBe(false);
      expect(config.motion).toBe(false);
      expect(mockMap.Overlays.load).toHaveBeenCalledWith(config);
      unmount();
      expect(mockMap.Overlays.unload).toHaveBeenCalledWith(config);
    });
  });

  describe("Tag", () => {
    it("adds and removes a tag with options", () => {
      mockMap.Tags = { add: vi.fn(), remove: vi.fn() };
      const { unmount } = renderInMap(
        mockMap,
        <Tag
          icon="big"
          label
          name="ธนาคาร"
          visibleRange={{ max: 20, min: 10 }}
        />
      );
      expect(mockMap.Tags.add).toHaveBeenCalledWith("ธนาคาร", {
        icon: "big",
        label: true,
        visibleRange: { max: 20, min: 10 },
      });
      unmount();
      expect(mockMap.Tags.remove).toHaveBeenCalledWith("ธนาคาร");
    });

    it("adds a tag without options", () => {
      mockMap.Tags = { add: vi.fn(), remove: vi.fn() };
      renderInMap(mockMap, <Tag name="%" />);
      expect(mockMap.Tags.add).toHaveBeenCalledWith("%", undefined);
    });

    it("removes each tag of a combined name", () => {
      const remove = vi.fn();
      mockMap.Tags = { add: vi.fn(), remove };
      const { unmount } = renderInMap(mockMap, <Tag name="ธนาคาร|โรงแรม" />);
      unmount();
      expect(remove.mock.calls).toEqual([["ธนาคาร"], ["โรงแรม"]]);
    });
  });

  describe("MapControl", () => {
    it("renders React children into a positioned map control", () => {
      const { unmount } = renderInMap(
        mockMap,
        <MapControl className="extra" group position="bottom-left">
          <button type="button">Recenter</button>
        </MapControl>
      );
      const control = mockMap.Ui.add.mock.calls[0]?.[0];
      expect(control.getDefaultPosition()).toBe("bottom-left");
      const container = control.onAdd();
      expect(container.className).toBe(
        "maplibregl-ctrl maplibregl-ctrl-group extra"
      );
      expect(container.textContent).toBe("Recenter");
      unmount();
      expect(mockMap.Ui.remove).toHaveBeenCalledWith(control);
    });
  });

  describe("MenuBar", () => {
    it("wraps sphere.MenuBar and reports changes with clean items", () => {
      const onChange = vi.fn();
      const items = [{ label: "Map" }, { label: "Satellite", value: "HYBRID" }];
      const { unmount } = renderInMap(
        mockMap,
        <MenuBar items={items} onChange={onChange} selectedIndex={1} />
      );

      const options = mockSphere.MenuBar.mock.calls[0]?.[0];
      const menu = mockSphere.MenuBar.mock.results[0]?.value;
      expect(options.button).toEqual(items);
      expect(options.button[0]).not.toBe(items[0]);
      expect(mockMap.Renderer.addControl).toHaveBeenCalledWith(
        menu,
        "bottom-right"
      );
      expect(menu.selectIndex).toHaveBeenCalledWith(1);

      options.change({ ...options.button[1], element: {} }, null);
      expect(onChange).toHaveBeenCalledWith(
        { label: "Satellite", value: "HYBRID" },
        null
      );
      unmount();
      expect(mockMap.Ui.remove).toHaveBeenCalledWith(menu);
    });
  });

  describe("placeholders", () => {
    it("RouteGuide attaches the route guide to its element", () => {
      mockMap.Route = { placeholder: vi.fn() } as never;
      const { container, unmount } = render(<RouteGuide className="guide" />, {
        wrapper: createProviderWrapper(mockMap),
      });
      const element = container.querySelector(".guide");
      expect(mockMap.Route.placeholder).toHaveBeenCalledWith(element);
      mockMap.Route.placeholder?.mockReturnValue(element);
      unmount();
      expect(mockMap.Route.placeholder).toHaveBeenLastCalledWith(
        expect.any(HTMLDivElement)
      );
    });

    it("RouteGuide inside a map uses that map, not the provider's active map", () => {
      const enclosing = { Route: { placeholder: vi.fn() } };
      mockMap.Route = { placeholder: vi.fn() } as never;
      render(
        <MapProvider isReady map={enclosing as never}>
          <RouteGuide />
        </MapProvider>,
        { wrapper: createProviderWrapper(mockMap) }
      );
      expect(enclosing.Route.placeholder).toHaveBeenCalled();
      expect(mockMap.Route.placeholder).not.toHaveBeenCalled();
    });

    it("SearchResults attaches the result list with an icon option", () => {
      mockMap.Search = { clear: vi.fn(), placeholder: vi.fn() } as never;
      const { container, unmount } = render(
        <SearchResults className="results" icon={false} />,
        { wrapper: createProviderWrapper(mockMap) }
      );
      const element = container.querySelector(".results");
      expect(mockMap.Search.placeholder).toHaveBeenCalledWith(element, {
        icon: false,
      });
      unmount();
      expect(mockMap.Search.clear).toHaveBeenCalled();
    });
  });
});
