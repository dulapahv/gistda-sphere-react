import { act, render, renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Circle, type CircleRef } from "@/components/Circle";
import { Polyline, type PolylineRef } from "@/components/Polyline";
import { Rectangle, type RectangleRef } from "@/components/Rectangle";
import {
  SphereProvider,
  useMap,
  useSphere,
  useSphereContext,
} from "@/context/SphereContext";
import { useSphereServices } from "@/hooks/useSphereServices";
import { useSphereUtils } from "@/hooks/useSphereUtils";
import { createProviderWrapper, renderInMap } from "./helpers";
import { createMockSphereApi } from "./setup";

const DOMAIN_HINT = /domain restrictions/;
const NOT_LOADED = /not loaded/;

describe("script loading", () => {
  const { mockSphere } = createMockSphereApi();

  beforeEach(() => {
    window.sphere = undefined;
    document.getElementById("gistda-sphere-api-script")?.remove();
  });

  it("reports a script load failure with guidance", async () => {
    const onError = vi.fn();
    function Status() {
      const { error } = useSphereContext();
      return <p>{error?.message ?? "none"}</p>;
    }
    const { getByText } = render(
      <SphereProvider apiKey="abc" onError={onError}>
        <Status />
      </SphereProvider>
    );
    const script = document.getElementById(
      "gistda-sphere-api-script"
    ) as HTMLScriptElement;
    expect(script.src).toBe("https://api.sphere.gistda.or.th/map/?key=abc");

    act(() => {
      script.onerror?.(new Event("error"));
    });
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(getByText(DOMAIN_HINT)).toBeInTheDocument();
  });

  it("loads the script and exposes the namespace", async () => {
    const onLoad = vi.fn();
    const { result } = renderHook(() => useSphere(), {
      wrapper: ({ children }) => (
        <SphereProvider
          apiKey="abc"
          onLoad={onLoad}
          scriptUrl="https://cdn/s.js"
        >
          {children}
        </SphereProvider>
      ),
    });
    const script = document.getElementById(
      "gistda-sphere-api-script"
    ) as HTMLScriptElement;
    expect(script.src).toBe("https://cdn/s.js");

    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    act(() => {
      script.onload?.(new Event("load"));
    });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.sphere).toBe(mockSphere);
    expect(onLoad).toHaveBeenCalled();
  });
});

describe("remaining refs and hooks", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const bangkok = { lat: 13.75, lon: 100.5 };

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  it("exposes Polyline, Rectangle and Circle ref methods", () => {
    const lineRef = createRef<PolylineRef>();
    const rectangleRef = createRef<RectangleRef>();
    const circleRef = createRef<CircleRef>();
    renderInMap(
      mockMap,
      <>
        <Polyline positions={[bangkok, { lat: 14, lon: 101 }]} ref={lineRef} />
        <Rectangle
          position={bangkok}
          ref={rectangleRef}
          size={{ height: 1, width: 1 }}
        />
        <Circle center={bangkok} radius={0.5} ref={circleRef} />
      </>
    );
    const line = mockSphere.Polyline.mock.results[0]?.value;
    const rectangle = mockSphere.Rectangle.mock.results[0]?.value;
    const circle = mockSphere.Circle.mock.results[0]?.value;
    const other = {} as never;

    expect(lineRef.current?.getPolyline()).toBe(line);
    lineRef.current?.union(other, { lineStyle: "Dashed" });
    expect(line.union).toHaveBeenCalledWith(other, { lineStyle: [6, 4] });
    lineRef.current?.rotate(30);
    expect(line.rotate).toHaveBeenCalledWith(30);
    lineRef.current?.togglePopup(true, bangkok);
    expect(line.pop).toHaveBeenCalledWith(true, bangkok);
    expect(lineRef.current?.getCentroid()).toEqual(bangkok);
    expect(lineRef.current?.getPivot()).toEqual(bangkok);

    expect(rectangleRef.current?.getRectangle()).toBe(rectangle);
    rectangleRef.current?.intersection(other);
    expect(rectangle.intersection).toHaveBeenCalledWith(other, undefined);

    expect(circleRef.current?.getCircle()).toBe(circle);
    // Plain text from formatArea, not Sphere's HTML `size(language)` output.
    expect(circleRef.current?.getArea("th")).toBe("100 m2 th");
    expect(circle.size).toHaveBeenLastCalledWith();
  });

  it("returns a services client bound to the provider key", () => {
    const { result } = renderHook(() => useSphereServices({ locale: "en" }), {
      wrapper: createProviderWrapper(mockMap),
    });
    expect(result.current.maps.wmtsCapabilitiesUrl()).toBe(
      "https://basemap.sphere.gistda.or.th/service?key=test-key"
    );
  });

  it("exposes the map from the provider", async () => {
    const { result } = renderHook(() => useMap(), {
      wrapper: createProviderWrapper(mockMap),
    });
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.map).toBe(mockMap);
  });

  it("wraps every Sphere converter and formatter", async () => {
    const { result } = renderHook(() => useSphereUtils(), {
      wrapper: createProviderWrapper(mockMap),
    });
    const utils = result.current;
    await utils.gpxToGeoJSON("<gpx></gpx>");
    await utils.gmlToGeoJSON("<gml:Point/>");
    await utils.esriJsonToGeoJSON({ x: 1, y: 2 });
    await utils.topoJsonToGeoJSON({ type: "Topology" }, "place");
    for (const library of ["gpx", "gml", "esrijson", "topojson"]) {
      expect(mockSphere.Util.initLibrary).toHaveBeenCalledWith(library);
    }
    expect(utils.formatDate("2026-10-22", "en")).toBe("2026-10-22 en");
    expect(utils.formatTime("13:45:00")).toBe("t:13:45:00");
    expect(utils.formatDateTimeRange("a", "b")).toBe("a-b th");
    expect(utils.formatInterval(60)).toBe("60 s th");
    expect(utils.formatThaiArea(1600)).toBe("1600 rai th");
    expect(utils.latitudeLength(13)).toBe(110_637);
    expect(utils.longitudeLength(13)).toBe(108_149);
    expect(utils.util).toBe(mockSphere.Util);
    expect(utils.math).toBe(mockSphere.Math);
  });

  it("explains that utilities need the API loaded", () => {
    window.sphere = undefined;
    const { result } = renderHook(() => useSphereUtils(), {
      wrapper: ({ children }) => (
        <SphereProvider apiKey="test-key">{children}</SphereProvider>
      ),
    });
    expect(() => result.current.formatDistance(1)).toThrow(NOT_LOADED);
  });
});
