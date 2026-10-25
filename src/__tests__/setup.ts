import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * A mock of the GISTDA Sphere API that mirrors the real runtime (verified
 * against the live script): enum values are the runtime values (dash arrays,
 * letter codes, bit flags), and `Event.fire` passes every argument through.
 */
type EventHandler = (...args: unknown[]) => unknown;

interface MockEvent {
  bind: Mock;
  fire: Mock;
  unbind: Mock;
}

interface MockOverlays {
  add: Mock;
  clear: Mock;
  lastOpenPopup: Mock;
  list: Mock;
  load: Mock;
  remove: Mock;
  size: Mock;
  unload: Mock;
}

interface MockLayers {
  add: Mock;
  clear: Mock;
  insert: Mock;
  language: Mock;
  list: Mock;
  remove: Mock;
  setBase: Mock;
  size: Mock;
}

interface MockControl {
  visible: Mock;
}

interface MockUi {
  add: Mock;
  ContextMenu: MockControl & { enableAddress: Mock; enableNearPoi: Mock };
  Crosshair: MockControl;
  DPad: MockControl;
  Fullscreen: MockControl;
  Geolocation: MockControl & { removeMarker: Mock; trigger: Mock };
  Keyboard: { enable: Mock };
  LayerSelector: MockControl & { language: Mock };
  language: Mock;
  lockMap: Mock;
  Mouse: {
    enable: Mock;
    enableClick: Mock;
    enableDrag: Mock;
    enableWheel: Mock;
  };
  remove: Mock;
  Scale: MockControl;
  Toolbar: MockControl;
  Zoombar: MockControl;
}

interface MockMap {
  /** Fires a MapLibre event (e.g. `moveend`) on the mock renderer. */
  _fireRenderer: (type: string) => void;
  _triggerClick: (location: object) => void;
  _triggerReady: () => void;
  _triggerZoom: () => void;
  bound: Mock;
  Event: MockEvent;
  enableFilter: Mock;
  goTo: Mock;
  id: Mock;
  Layers: MockLayers;
  language: Mock;
  location: Mock;
  move: Mock;
  Overlays: MockOverlays;
  pitch: Mock;
  placeholder: Mock;
  Renderer: Record<string, Mock>;
  Route: Record<string, Mock>;
  repaint: Mock;
  resize: Mock;
  rotate: Mock;
  Search: Record<string, Mock>;
  Tags: Record<string, Mock>;
  Ui: MockUi;
  zoom: Mock;
  zoomRange: Mock;
}

interface MockSphere {
  Circle: Mock;
  CustomControl: Mock;
  Dot: Mock;
  EventName: Record<string, string>;
  Filter: Record<string, string | false>;
  Layer: Mock;
  Layers: Record<string, object>;
  LayerType: Record<string, string>;
  LineStyle: Record<string, number[]>;
  Map: Mock;
  Marker: Mock;
  Math: Record<string, Mock>;
  MenuBar: Mock;
  ObjectLabel: { Title: object };
  Overlays: Record<string, unknown>;
  Polygon: Mock;
  Polyline: Mock;
  Popup: Mock;
  Rectangle: Mock;
  RouteLabel: Record<string, string | false>;
  RouteLine: Record<string, string>;
  RouteMode: Record<string, string>;
  RouteRestrict: Record<string, number>;
  RouteType: Record<string, number>;
  TagType: Record<string, string>;
  UiComponent: Record<string, string | false>;
  Util: Record<string, Mock>;
}

interface MockSphereApi {
  mockMap: MockMap;
  mockSphere: MockSphere;
}

/** Mock for a getter/setter method: returns `value` as a getter, `self` as a setter. */
function accessor(value: unknown, self: () => unknown): Mock {
  return vi
    .fn()
    .mockImplementation((...args: unknown[]) =>
      args.length === 0 || args[0] === undefined ? value : self()
    );
}

/** Mock for a built-in UI control with `visible()`. */
function control(): MockControl {
  const self: MockControl = {
    visible: vi.fn(),
  };
  self.visible.mockImplementation((state?: boolean) =>
    state === undefined ? true : self
  );
  return self;
}

export function createMockSphereApi(): MockSphereApi {
  const eventHandlers: Record<string, Set<EventHandler>> = {};
  const rendererHandlers: Record<string, Set<() => void>> = {};

  const mockEvent: MockEvent = {
    bind: vi.fn((eventName: string, handler: EventHandler) => {
      if (!eventHandlers[eventName]) {
        eventHandlers[eventName] = new Set();
      }
      eventHandlers[eventName].add(handler);
      return mockEvent;
    }),
    // Like Sphere, handlers receive every argument and `false` cancels.
    fire: vi.fn((eventName: string, ...args: unknown[]) => {
      let canceled = false;
      for (const handler of eventHandlers[eventName] ?? []) {
        canceled = handler(...args) === false || canceled;
      }
      return !canceled;
    }),
    unbind: vi.fn((eventName: string, handler: EventHandler) => {
      eventHandlers[eventName]?.delete(handler);
      return mockEvent;
    }),
  };

  const mockOverlays: MockOverlays = {
    add: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    lastOpenPopup: vi.fn().mockReturnValue(null),
    list: vi.fn().mockReturnValue([]),
    load: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(0),
    unload: vi.fn().mockReturnThis(),
  };

  const mockLayers: MockLayers = {
    // Like Sphere for a layer whose style is loaded: added at once, then
    // announced with `layerChange`.
    add: vi.fn((layer: unknown) => {
      mockEvent.fire("layerChange", layer);
      return mockLayers;
    }),
    clear: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnThis(),
    list: vi.fn().mockReturnValue([]),
    remove: vi.fn().mockReturnThis(),
    setBase: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(0),
  };

  const placeholder = document.createElement("div");

  const mockUi: MockUi = {
    add: vi.fn().mockReturnThis(),
    ContextMenu: {
      ...control(),
      enableAddress: vi.fn().mockReturnValue(true),
      enableNearPoi: vi.fn().mockReturnValue(true),
    },
    Crosshair: control(),
    DPad: control(),
    Fullscreen: control(),
    Geolocation: {
      ...control(),
      removeMarker: vi.fn(),
      trigger: vi.fn().mockReturnValue(true),
    },
    Keyboard: { enable: vi.fn().mockReturnValue(true) },
    LayerSelector: { ...control(), language: vi.fn() },
    language: vi.fn().mockReturnValue("th"),
    lockMap: vi.fn(),
    Mouse: {
      enable: vi.fn(),
      enableClick: vi.fn().mockReturnValue(true),
      enableDrag: vi.fn().mockReturnValue(true),
      enableWheel: vi.fn().mockReturnValue(true),
    },
    remove: vi.fn().mockReturnThis(),
    Scale: control(),
    Toolbar: control(),
    Zoombar: control(),
  };

  const mockMap: MockMap = {
    _fireRenderer: (type: string) => {
      for (const handler of rendererHandlers[type] ?? []) {
        handler();
      }
    },
    _triggerClick: (location: object) => mockEvent.fire("click", location),
    // Helper to trigger ready event in tests
    _triggerReady: () => mockEvent.fire("ready"),
    _triggerZoom: () => mockEvent.fire("zoom"),
    bound: vi
      .fn()
      .mockImplementation((value?: object) =>
        value === undefined
          ? { maxLat: 14, maxLon: 101, minLat: 13, minLon: 100 }
          : mockMap
      ),
    Event: mockEvent,
    enableFilter: vi.fn().mockReturnThis(),
    goTo: vi.fn().mockReturnThis(),
    id: vi.fn().mockReturnValue(1),
    Layers: mockLayers,
    language: accessor("th", () => mockMap),
    location: vi
      .fn()
      .mockImplementation((value?: object) =>
        value === undefined ? { lat: 13.75, lon: 100.5 } : mockMap
      ),
    move: vi.fn().mockReturnThis(),
    Overlays: mockOverlays,
    pitch: accessor(0, () => mockMap),
    placeholder: vi.fn().mockReturnValue(placeholder),
    Renderer: {
      addControl: vi.fn(),
      hasControl: vi.fn().mockReturnValue(false),
      off: vi.fn((type: string, handler: () => void) => {
        rendererHandlers[type]?.delete(handler);
      }),
      on: vi.fn((type: string, handler: () => void) => {
        rendererHandlers[type] ??= new Set();
        rendererHandlers[type].add(handler);
      }),
      remove: vi.fn(),
      removeControl: vi.fn(),
    },
    Route: {},
    repaint: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    rotate: accessor(0, () => mockMap),
    Search: {},
    Tags: {},
    Ui: mockUi,
    zoom: accessor(10, () => mockMap),
    zoomRange: vi.fn().mockReturnThis(),
  };

  const overlayProps = () => ({
    active: vi.fn().mockReturnValue(true),
    bound: vi.fn().mockReturnValue({
      maxLat: 14,
      maxLon: 101,
      minLat: 13,
      minLon: 100,
    }),
    centroid: vi.fn().mockReturnValue({ lat: 13.75, lon: 100.5 }),
    contains: vi.fn().mockReturnValue(false),
    detail: vi.fn().mockReturnThis(),
    difference: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnValue(0),
    element: vi.fn().mockReturnValue(document.createElement("div")),
    intersection: vi.fn().mockReturnThis(),
    intersects: vi.fn().mockReturnValue(false),
    location: vi.fn().mockReturnValue({ lat: 13.75, lon: 100.5 }),
    pivot: vi.fn().mockReturnValue({ lat: 13.75, lon: 100.5 }),
    pop: vi.fn().mockReturnThis(),
    popup: vi.fn().mockReturnValue(null),
    radius: vi.fn().mockReturnValue(100),
    rotate: vi.fn().mockReturnThis(),
    shift: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(100),
    split: vi.fn().mockReturnValue([]),
    title: vi.fn().mockReturnThis(),
    toJSON: vi.fn().mockReturnValue({}),
    union: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    visibleRange: vi.fn().mockReturnValue({ max: 22, min: 0 }),
    within: vi.fn().mockReturnValue(false),
  });
  const createMockOverlay = (_type: string) =>
    vi.fn().mockImplementation(function () {
      return overlayProps();
    });

  const mapConstructor = function () {
    return mockMap;
  };
  const mockSphere: MockSphere = {
    Circle: createMockOverlay("Circle"),
    CustomControl: vi.fn().mockImplementation(function () {
      return { onAdd: vi.fn(), onRemove: vi.fn(), visible: vi.fn() };
    }),
    Dot: createMockOverlay("Dot"),
    EventName: {},
    Filter: {
      Dark: "DARK",
      Deuteranopia: "DEUTERANOPIA",
      Light: "LIGHT",
      None: false,
      Protanopia: "PROTANOPIA",
    },
    Layer: vi.fn().mockImplementation(function () {
      return {};
    }),
    Layers: {
      DROUGHT: { style: "drought" },
      FLOOD: { style: "flood" },
      HOTSPOT: { style: "hotspot" },
      HYBRID: { style: "hybrid" },
      IMAGES: { style: "images" },
      PM25: { style: "pm25" },
      SIMPLE: { style: "simple" },
      STREETS: { style: "streets" },
      STREETS_NIGHT: { style: "night" },
      TRAFFIC: { style: "traffic" },
    },
    LayerType: {
      I3S: "I3S",
      Tiles3D: "Tiles3D",
      TMS: "TMS",
      Vector: "Vector",
      WMS: "WMS",
      WMTS: "WMTS",
      WMTS_REST: "WMTS_REST",
      XYZ: "XYZ",
    },
    LineStyle: {
      Dashed: [6, 4],
      Dot: [2, 2],
      Solid: [0],
    },
    Map: vi.fn().mockImplementation(mapConstructor),
    Marker: createMockOverlay("Marker"),
    Math: {
      closestPointOnLine: vi.fn(),
      distance: vi.fn(),
      lineIntersectPoint: vi.fn(),
    },
    MenuBar: vi.fn().mockImplementation(function () {
      return {
        onAdd: vi.fn(),
        onRemove: vi.fn(),
        selectIndex: vi.fn(),
        visible: vi.fn(),
      };
    }),
    ObjectLabel: { Title: {} },
    Overlays: {
      aqi: { popup: true },
      cameras: { motion: true, popup: true },
      events: { popup: true },
      Object: vi.fn().mockImplementation(function () {
        return { popup: true, url: "" };
      }),
    },
    Polygon: createMockOverlay("Polygon"),
    Polyline: createMockOverlay("Polyline"),
    Popup: createMockOverlay("Popup"),
    Rectangle: createMockOverlay("Rectangle"),
    RouteLabel: { Distance: "d", Hide: false, Time: "t" },
    RouteLine: {
      Destination: "destination",
      Ferry: "ferry",
      Focus: "focus",
      Road: "road",
    },
    RouteMode: { Cost: "c", Distance: "d", Fly: "f", Traffic: "t" },
    RouteRestrict: { Bike: 1 },
    RouteType: { All: 127, Ferry: 8, Road: 1, Tollway: 16 },
    TagType: { OGC: "OGC", WFS: "WFS" },
    UiComponent: { Full: "FULL", Mobile: "MOBILE", None: false },
    Util: {
      EsriJSONToGeoJSON: vi.fn().mockReturnValue({ type: "Point" }),
      formatArea: vi.fn((value: number, lang: string) => `${value} m2 ${lang}`),
      formatDate: vi.fn((value: string, lang: string) => `${value} ${lang}`),
      formatDateTimeRange: vi.fn(
        (start: string, stop: string, lang: string) =>
          `${start}-${stop} ${lang}`
      ),
      formatDistance: vi.fn(
        (value: number, lang: string) => `${value} m ${lang}`
      ),
      formatInterval: vi.fn(
        (value: number, lang: string) => `${value} s ${lang}`
      ),
      formatThaiArea: vi.fn(
        (value: number, lang: string) => `${value} rai ${lang}`
      ),
      formatTime: vi.fn((value: string) => `t:${value}`),
      GMLToGeoJSON: vi.fn().mockReturnValue({ type: "Point" }),
      GPXToGeoJSON: vi
        .fn()
        .mockReturnValue({ features: [], type: "FeatureCollection" }),
      initLibrary: vi.fn().mockResolvedValue(undefined),
      KMLToGeoJSON: vi
        .fn()
        .mockReturnValue({ features: [], type: "FeatureCollection" }),
      latitudeLength: vi.fn().mockReturnValue(110_637),
      longitudeLength: vi.fn().mockReturnValue(108_149),
      project: vi.fn().mockReturnValue([608_446, 1_437_348]),
      TopoJSONToGeoJSON: vi.fn().mockReturnValue({ type: "LineString" }),
      WKTToGeoJSON: vi
        .fn()
        .mockReturnValue({ coordinates: [100, 13], type: "Point" }),
    },
  };

  return { mockMap, mockSphere };
}

export function setupSphereGlobal(): MockSphereApi {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
  });

  afterEach(() => {
    window.sphere = undefined;
    vi.clearAllMocks();
  });

  return { mockMap, mockSphere };
}
