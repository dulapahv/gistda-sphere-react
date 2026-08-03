import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * Creates a mock Sphere API for testing.
 * This mock simulates the behavior of the GISTDA Sphere API.
 */
type EventHandler = (data?: unknown) => void;

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
  language: Mock;
  list: Mock;
  remove: Mock;
  setBase: Mock;
  size: Mock;
}

interface MockMap {
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
  Renderer: { on: Mock };
  Route: Record<string, never>;
  repaint: Mock;
  resize: Mock;
  rotate: Mock;
  Search: Record<string, never>;
  Tags: Record<string, never>;
  Ui: Record<string, never>;
  zoom: Mock;
  zoomRange: Mock;
}

interface MockSphere {
  Circle: Mock;
  Dot: Mock;
  EventName: Record<string, never>;
  Filter: Record<string, string>;
  Layer: Mock;
  Layers: Record<string, object>;
  LayerType: Record<string, string>;
  LineStyle: Record<string, string>;
  Map: Mock;
  Marker: Mock;
  Math: Record<string, never>;
  Overlays: Record<string, never>;
  Polygon: Mock;
  Polyline: Mock;
  Popup: Mock;
  Rectangle: Mock;
  RouteLabel: Record<string, string>;
  RouteMode: Record<string, string>;
  RouteType: Record<string, string>;
  TagType: Record<string, string>;
  Util: Record<string, never>;
}

interface MockSphereApi {
  mockMap: MockMap;
  mockSphere: MockSphere;
}

export function createMockSphereApi(): MockSphereApi {
  const eventHandlers: Record<string, Set<EventHandler>> = {};

  const mockEvent = {
    bind: vi.fn((eventName: string, handler: EventHandler) => {
      if (!eventHandlers[eventName]) {
        eventHandlers[eventName] = new Set();
      }
      eventHandlers[eventName].add(handler);
      return mockEvent;
    }),
    fire: vi.fn((eventName: string, data?: unknown) => {
      const handlers = eventHandlers[eventName];
      if (handlers) {
        for (const handler of handlers) {
          handler(data);
        }
      }
    }),
    unbind: vi.fn((eventName: string, handler: EventHandler) => {
      eventHandlers[eventName]?.delete(handler);
      return mockEvent;
    }),
  };

  const mockOverlays = {
    add: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    lastOpenPopup: vi.fn().mockReturnValue(null),
    list: vi.fn().mockReturnValue([]),
    load: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(0),
    unload: vi.fn().mockReturnThis(),
  };

  const mockLayers = {
    add: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnThis(),
    list: vi.fn().mockReturnValue([]),
    remove: vi.fn().mockReturnThis(),
    setBase: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(0),
  };

  const mockMap = {
    _triggerClick: (location: object) => mockEvent.fire("click", location),
    // Helper to trigger ready event in tests
    _triggerReady: () => mockEvent.fire("ready"),
    _triggerZoom: () => mockEvent.fire("zoom"),
    bound: vi.fn().mockReturnThis(),
    Event: mockEvent,
    enableFilter: vi.fn().mockReturnThis(),
    goTo: vi.fn().mockReturnThis(),
    id: vi.fn().mockReturnValue(1),
    Layers: mockLayers,
    language: vi.fn().mockReturnValue("th"),
    location: vi
      .fn()
      .mockImplementation((value?: object) =>
        value === undefined ? { lat: 13.75, lon: 100.5 } : mockMap
      ),
    move: vi.fn().mockReturnThis(),
    Overlays: mockOverlays,
    pitch: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 0 : mockMap
      ),
    placeholder: vi.fn().mockReturnValue(document.createElement("div")),
    Renderer: { on: vi.fn() },
    Route: {},
    repaint: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    rotate: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 0 : mockMap
      ),
    Search: {},
    Tags: {},
    Ui: {},
    zoom: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 10 : mockMap
      ),
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
  const mockSphere = {
    Circle: createMockOverlay("Circle"),
    Dot: createMockOverlay("Dot"),
    EventName: {},
    Filter: {
      Dark: "Dark" as const,
      Deuteranopia: "Deuteranopia" as const,
      Light: "Light" as const,
      None: "None" as const,
      Protanopia: "Protanopia" as const,
    },
    Layer: vi.fn().mockImplementation(function () {
      return {};
    }),
    Layers: {
      DROUGHT: {},
      FLOOD: {},
      HOTSPOT: {},
      HYBRID: {},
      IMAGES: {},
      PM25: {},
      SIMPLE: {},
      STREETS: {},
      STREETS_NIGHT: {},
      TRAFFIC: {},
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
      Dashed: "Dashed",
      Dot: "Dot",
      Solid: "Solid",
    },
    Map: vi.fn().mockImplementation(mapConstructor),
    Marker: createMockOverlay("Marker"),
    Math: {},
    Overlays: {},
    Polygon: createMockOverlay("Polygon"),
    Polyline: createMockOverlay("Polyline"),
    Popup: createMockOverlay("Popup"),
    Rectangle: createMockOverlay("Rectangle"),
    RouteLabel: { Distance: "Distance", Hide: "Hide", Time: "Time" },
    RouteMode: {
      Cost: "Cost",
      Distance: "Distance",
      Fly: "Fly",
      Traffic: "Traffic",
    },
    RouteType: { All: "All", Ferry: "Ferry", Road: "Road", Tollway: "Tollway" },
    TagType: { OGC: "OGC", WFS: "WFS" },
    Util: {},
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
