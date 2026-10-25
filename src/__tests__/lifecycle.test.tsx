import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Circle, type CircleRef } from "@/components/Circle";
import { Dot, type DotRef } from "@/components/Dot";
import { Layer } from "@/components/Layer";
import { Marker, type MarkerRef } from "@/components/Marker";
import { Polygon, type PolygonRef } from "@/components/Polygon";
import { Polyline, type PolylineRef } from "@/components/Polyline";
import { Popup, type PopupRef } from "@/components/Popup";
import { Rectangle, type RectangleRef } from "@/components/Rectangle";
import { SphereMap } from "@/components/SphereMap";
import { SphereProvider } from "@/context/SphereContext";
import { renderInMap } from "./helpers";
import { createMockSphereApi } from "./setup";

describe("overlay lifecycles", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const bangkok = { lat: 13.75, lon: 100.5 };

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  /** Renders `children` in a ready map and returns a re-render function. */
  function mount(children: React.ReactNode) {
    const utils = render(
      <SphereProvider apiKey="test-key">
        <SphereMap>{children}</SphereMap>
      </SphereProvider>
    );
    act(() => {
      mockMap._triggerReady();
    });
    return (next: React.ReactNode) =>
      utils.rerender(
        <SphereProvider apiKey="test-key">
          <SphereMap>{next}</SphereMap>
        </SphereProvider>
      );
  }

  describe("Marker", () => {
    it("moves instead of re-creating when the position changes", () => {
      const rerender = mount(<Marker position={bangkok} />);
      const marker = mockSphere.Marker.mock.results[0]?.value;

      rerender(<Marker animate={300} position={{ lat: 14, lon: 101 }} />);

      expect(mockSphere.Marker).toHaveBeenCalledTimes(1);
      expect(marker.location).toHaveBeenCalledWith({ lat: 14, lon: 101 }, 300);
    });

    it("does not re-create for an equal inline position", () => {
      const rerender = mount(<Marker position={{ ...bangkok }} />);
      rerender(<Marker position={{ ...bangkok }} />);
      expect(mockSphere.Marker).toHaveBeenCalledTimes(1);
    });

    it("updates rotation and dragging in place", () => {
      const rerender = mount(<Marker position={bangkok} rotate={0} />);
      const marker = mockSphere.Marker.mock.results[0]?.value;

      rerender(<Marker draggable position={bangkok} rotate={90} />);

      expect(mockSphere.Marker).toHaveBeenCalledTimes(1);
      expect(marker.update).toHaveBeenCalledWith({ rotate: 90 });
      expect(marker.update).toHaveBeenCalledWith({ draggable: true });
    });

    it("renders React children as the icon", () => {
      const host = document.createElement("div");
      host.innerHTML = '<div data-sphere-react-marker=""></div>';
      mockSphere.Marker.mockImplementationOnce(function () {
        return { ...markerStub(), element: vi.fn().mockReturnValue(host) };
      });

      mount(
        <Marker icon={{ offset: { x: 5, y: 10 } }} position={bangkok}>
          <span>Custom pin</span>
        </Marker>
      );

      const options = mockSphere.Marker.mock.calls[0]?.[1];
      expect(options.icon).toEqual({
        html: '<div data-sphere-react-marker=""></div>',
        offset: { x: 5, y: 10 },
      });
      expect(host.textContent).toBe("Custom pin");
    });

    it("renders React popup content when the popup opens", () => {
      mount(
        <Marker popupContent={<b>Details</b>} position={bangkok} title="Here" />
      );
      const options = mockSphere.Marker.mock.calls[0]?.[1];
      expect(options.popup.title).toBe("Here");

      const detail = document.createElement("div");
      act(() => {
        options.popup.loadDetail(detail);
      });
      expect(detail.innerHTML).toBe("<b>Details</b>");
    });

    it("accepts GeoJSON positions", () => {
      const point = { coordinates: [100.5, 13.75], type: "Point" as const };
      mount(<Marker position={point} />);
      expect(mockSphere.Marker).toHaveBeenCalledWith(point, {});
    });

    it("exposes ref helpers", () => {
      const ref = createRef<MarkerRef>();
      mount(<Marker position={bangkok} ref={ref} />);
      const marker = mockSphere.Marker.mock.results[0]?.value;

      expect(ref.current?.getPosition()).toEqual(bangkok);
      ref.current?.setPosition({ lat: 1, lon: 2 }, true);
      expect(marker.location).toHaveBeenCalledWith({ lat: 1, lon: 2 }, true);
      ref.current?.setRotation(45);
      expect(marker.update).toHaveBeenCalledWith({ rotate: 45 });
      ref.current?.togglePopup(true);
      expect(marker.pop).toHaveBeenCalledWith(true);
      expect(ref.current?.getElement()).toBeInstanceOf(HTMLElement);
      ref.current?.distanceTo({ lat: 14, lon: 101 }, "en");
      expect(mockSphere.Dot).toHaveBeenCalledWith({ lat: 14, lon: 101 });
    });
  });

  describe("geometries", () => {
    const square = [
      { lat: 13.8, lon: 100.4 },
      { lat: 13.8, lon: 100.6 },
      { lat: 13.6, lon: 100.6 },
    ];

    it("updates styles in place and converts line styles", () => {
      const rerender = mount(
        <Polygon fillColor="red" lineStyle="Solid" positions={square} />
      );
      const polygon = mockSphere.Polygon.mock.results[0]?.value;
      expect(mockSphere.Polygon.mock.calls[0]?.[1]).toEqual({
        fillColor: "red",
        lineStyle: [0],
      });

      rerender(
        <Polygon fillColor="blue" lineStyle="Dashed" positions={square} />
      );

      expect(mockSphere.Polygon).toHaveBeenCalledTimes(1);
      expect(polygon.update).toHaveBeenCalledWith({
        fillColor: "blue",
        lineStyle: [6, 4],
      });
    });

    it("keeps the overlay for equal inline positions, re-creates on change", () => {
      const rerender = mount(<Polyline positions={[...square]} />);
      rerender(<Polyline positions={[...square]} />);
      expect(mockSphere.Polyline).toHaveBeenCalledTimes(1);

      rerender(<Polyline positions={square.slice(0, 2)} />);
      expect(mockSphere.Polyline).toHaveBeenCalledTimes(2);
      expect(mockMap.Overlays.remove).toHaveBeenCalledTimes(1);
    });

    it("re-creates when a non-style option changes", () => {
      const rerender = mount(<Circle center={bangkok} radius={1} title="A" />);
      rerender(<Circle center={bangkok} radius={1} title="B" />);
      expect(mockSphere.Circle).toHaveBeenCalledTimes(2);
    });

    it("skips incomplete shapes", () => {
      mount(
        <>
          <Polygon positions={square.slice(0, 2)} />
          <Polyline positions={square.slice(0, 1)} />
        </>
      );
      expect(mockSphere.Polygon).not.toHaveBeenCalled();
      expect(mockSphere.Polyline).not.toHaveBeenCalled();
    });

    it("supports holes separated by null", () => {
      mount(<Polygon positions={[...square, null, ...square]} />);
      expect(mockSphere.Polygon).toHaveBeenCalledWith(
        [...square, null, ...square],
        {}
      );
    });

    it("renders React popup content", () => {
      mount(<Polygon popupContent={<i>Area</i>} positions={square} />);
      const options = mockSphere.Polygon.mock.calls[0]?.[1];
      const detail = document.createElement("div");
      act(() => {
        options.popup.loadDetail(detail);
      });
      expect(detail.innerHTML).toBe("<i>Area</i>");
    });

    it("moves a dot instead of re-creating it", () => {
      const rerender = mount(<Dot position={bangkok} />);
      const dot = mockSphere.Dot.mock.results[0]?.value;
      rerender(<Dot position={{ lat: 15, lon: 101 }} />);
      expect(mockSphere.Dot).toHaveBeenCalledTimes(1);
      expect(dot.location).toHaveBeenCalledWith({ lat: 15, lon: 101 });
    });

    it("exposes polygon operations and measurements on refs", () => {
      const polygonRef = createRef<PolygonRef>();
      const rectangleRef = createRef<RectangleRef>();
      const lineRef = createRef<PolylineRef>();
      const circleRef = createRef<CircleRef>();
      const dotRef = createRef<DotRef>();
      mount(
        <>
          <Polygon positions={square} ref={polygonRef} />
          <Rectangle
            position={bangkok}
            ref={rectangleRef}
            size={{ height: 1, width: 1 }}
          />
          <Polyline positions={square} ref={lineRef} />
          <Circle center={bangkok} radius={1} ref={circleRef} />
          <Dot position={bangkok} ref={dotRef} />
        </>
      );
      const polygon = mockSphere.Polygon.mock.results[0]?.value;
      const other = {} as never;

      polygonRef.current?.union(other, { lineStyle: "Dot" });
      expect(polygon.union).toHaveBeenCalledWith(other, { lineStyle: [2, 2] });
      polygonRef.current?.intersection(other);
      polygonRef.current?.difference(other);
      expect(polygonRef.current?.split(other)).toEqual([]);
      expect(polygonRef.current?.getArea("en")).toBe("100 m2 en");
      expect(polygonRef.current?.contains({ lat: 13.7, lon: 100.5 })).toBe(
        false
      );
      expect(polygonRef.current?.getBound()).toEqual({
        maxLat: 14,
        maxLon: 101,
        minLat: 13,
        minLon: 100,
      });
      polygonRef.current?.updateStyle({
        lineStyle: "Dashed",
        title: "ignored",
      });
      expect(polygon.update).toHaveBeenCalledWith({ lineStyle: [6, 4] });

      expect(rectangleRef.current?.getArea()).toBe(100);
      expect(lineRef.current?.getLength()).toBe(100);
      expect(circleRef.current?.getRadius("en")).toBe(100);
      expect(circleRef.current?.getCenter()).toEqual(bangkok);
      expect(dotRef.current?.getPosition()).toEqual(bangkok);
    });
  });

  describe("Popup", () => {
    it("renders children in the popup body and moves in place", () => {
      const ref = createRef<PopupRef>();
      const rerender = mount(
        <Popup position={bangkok} ref={ref} title="Hello">
          <em>Body</em>
        </Popup>
      );
      const options = mockSphere.Popup.mock.calls[0]?.[1];
      expect(options.title).toBe("Hello");

      const detail = document.createElement("div");
      act(() => {
        options.loadDetail(detail);
      });
      expect(detail.innerHTML).toBe("<em>Body</em>");

      const popup = mockSphere.Popup.mock.results[0]?.value;
      rerender(
        <Popup position={{ lat: 15, lon: 101 }} title="Hello">
          <em>Body</em>
        </Popup>
      );
      expect(mockSphere.Popup).toHaveBeenCalledTimes(1);
      expect(popup.location).toHaveBeenCalledWith({ lat: 15, lon: 101 });
    });

    it("calls onClose for its own popup", () => {
      const onClose = vi.fn();
      mount(<Popup onClose={onClose} position={bangkok} />);
      const popup = mockSphere.Popup.mock.results[0]?.value;
      act(() => {
        mockMap.Event.fire("popupClose", {});
        mockMap.Event.fire("popupClose", popup);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Layer", () => {
    it("adds a vector style layer", () => {
      renderInMap(mockMap, <Layer style="https://example.com/style.json" />);
      expect(mockSphere.Layer).toHaveBeenCalledWith(
        "https://example.com/style.json"
      );
      expect(mockMap.Layers.add).toHaveBeenCalled();
    });

    it("passes 3D tile options and a stable tileset callback", () => {
      const onTilesetLoad = vi.fn();
      renderInMap(
        mockMap,
        <Layer
          name="3dt"
          onTilesetLoad={onTilesetLoad}
          opacity={0.5}
          type="Tiles3D"
          url="https://example.com/tileset.json"
        />
      );
      const [, options] = mockSphere.Layer.mock.calls[0] ?? [];
      expect(options).toMatchObject({
        opacity: 0.5,
        type: "Tiles3D",
        url: "https://example.com/tileset.json",
      });
      options.onTilesetLoad({ zoom: 15 });
      expect(onTilesetLoad).toHaveBeenCalledWith({ zoom: 15 });
    });

    it("adds raw layers and supports empty names", () => {
      const raw = { id: "heat", type: "heatmap" };
      renderInMap(
        mockMap,
        <>
          <Layer layer={raw} />
          <Layer name="" type="TMS" url="https://example.com/tms" />
        </>
      );
      expect(mockMap.Layers.add).toHaveBeenCalledWith(raw, undefined);
      expect(mockSphere.Layer).toHaveBeenCalledWith("", {
        type: "TMS",
        url: "https://example.com/tms",
      });
    });
  });
});

/** Minimal marker stub for one-off constructor overrides. */
function markerStub() {
  return {
    element: vi.fn(),
    location: vi.fn().mockReturnValue({ lat: 13.75, lon: 100.5 }),
    pop: vi.fn(),
    update: vi.fn(),
  };
}
