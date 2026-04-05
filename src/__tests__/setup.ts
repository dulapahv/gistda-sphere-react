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
    unbind: vi.fn((eventName: string, handler: EventHandler) => {
      eventHandlers[eventName]?.delete(handler);
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
  };

  const mockOverlays = {
    add: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    load: vi.fn().mockReturnThis(),
    unload: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    list: vi.fn().mockReturnValue([]),
    size: vi.fn().mockReturnValue(0),
    lastOpenPopup: vi.fn().mockReturnValue(null),
  };

  const mockLayers = {
    setBase: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    list: vi.fn().mockReturnValue([]),
    size: vi.fn().mockReturnValue(0),
    language: vi.fn().mockReturnThis(),
  };

  const mockMap = {
    Event: mockEvent,
    Overlays: mockOverlays,
    Layers: mockLayers,
    Ui: {},
    Search: {},
    Tags: {},
    Route: {},
    Renderer: { on: vi.fn() },
    id: vi.fn().mockReturnValue(1),
    resize: vi.fn().mockReturnThis(),
    repaint: vi.fn().mockReturnThis(),
    placeholder: vi.fn().mockReturnValue(document.createElement("div")),
    zoom: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 10 : mockMap
      ),
    zoomRange: vi.fn().mockReturnThis(),
    location: vi
      .fn()
      .mockImplementation((value?: object) =>
        value === undefined ? { lon: 100.5, lat: 13.75 } : mockMap
      ),
    bound: vi.fn().mockReturnThis(),
    move: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnValue("th"),
    rotate: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 0 : mockMap
      ),
    pitch: vi
      .fn()
      .mockImplementation((value?: number) =>
        value === undefined ? 0 : mockMap
      ),
    enableFilter: vi.fn().mockReturnThis(),
    goTo: vi.fn().mockReturnThis(),
    // Helper to trigger ready event in tests
    _triggerReady: () => mockEvent.fire("ready"),
    _triggerClick: (location: object) => mockEvent.fire("click", location),
    _triggerZoom: () => mockEvent.fire("zoom"),
  };

  const overlayProps = () => ({
    location: vi.fn().mockReturnValue({ lon: 100.5, lat: 13.75 }),
    visibleRange: vi.fn().mockReturnValue({ min: 0, max: 22 }),
    active: vi.fn().mockReturnValue(true),
    shift: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnValue(0),
    intersects: vi.fn().mockReturnValue(false),
    contains: vi.fn().mockReturnValue(false),
    within: vi.fn().mockReturnValue(false),
    toJSON: vi.fn().mockReturnValue({}),
    popup: vi.fn().mockReturnValue(null),
    element: vi.fn().mockReturnValue(document.createElement("div")),
    pop: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    pivot: vi.fn().mockReturnValue({ lon: 100.5, lat: 13.75 }),
    centroid: vi.fn().mockReturnValue({ lon: 100.5, lat: 13.75 }),
    bound: vi.fn().mockReturnValue({
      minLon: 100,
      minLat: 13,
      maxLon: 101,
      maxLat: 14,
    }),
    rotate: vi.fn().mockReturnThis(),
    size: vi.fn().mockReturnValue(100),
    union: vi.fn().mockReturnThis(),
    intersection: vi.fn().mockReturnThis(),
    difference: vi.fn().mockReturnThis(),
    split: vi.fn().mockReturnValue([]),
    radius: vi.fn().mockReturnValue(100),
    title: vi.fn().mockReturnThis(),
    detail: vi.fn().mockReturnThis(),
  });
  const createMockOverlay = (_type: string) =>
    vi.fn().mockImplementation(function () {
      return overlayProps();
    });

  const mapConstructor = function () {
    return mockMap;
  };
  const mockSphere = {
    Map: vi.fn().mockImplementation(mapConstructor),
    Marker: createMockOverlay("Marker"),
    Popup: createMockOverlay("Popup"),
    Polyline: createMockOverlay("Polyline"),
    Polygon: createMockOverlay("Polygon"),
    Circle: createMockOverlay("Circle"),
    Dot: createMockOverlay("Dot"),
    Rectangle: createMockOverlay("Rectangle"),
    Layer: vi.fn().mockImplementation(function () {
      return {};
    }),
    Layers: {
      SIMPLE: {},
      STREETS: {},
      STREETS_NIGHT: {},
      HYBRID: {},
      TRAFFIC: {},
      IMAGES: {},
      PM25: {},
      HOTSPOT: {},
      FLOOD: {},
      DROUGHT: {},
    },
    LayerType: {
      Vector: "Vector",
      XYZ: "XYZ",
      WMS: "WMS",
      WMTS: "WMTS",
      WMTS_REST: "WMTS_REST",
      TMS: "TMS",
      Tiles3D: "Tiles3D",
      I3S: "I3S",
    },
    LineStyle: {
      Solid: "Solid",
      Dashed: "Dashed",
      Dot: "Dot",
    },
    Filter: {
      Dark: "Dark" as const,
      Light: "Light" as const,
      Protanopia: "Protanopia" as const,
      Deuteranopia: "Deuteranopia" as const,
      None: "None" as const,
    },
    EventName: {},
    TagType: { WFS: "WFS", OGC: "OGC" },
    RouteMode: {
      Traffic: "Traffic",
      Cost: "Cost",
      Distance: "Distance",
      Fly: "Fly",
    },
    RouteType: { Road: "Road", Ferry: "Ferry", Tollway: "Tollway", All: "All" },
    RouteLabel: { Distance: "Distance", Time: "Time", Hide: "Hide" },
    Util: {},
    Math: {},
    Overlays: {},
  };

  return { mockSphere, mockMap };
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

  return { mockSphere, mockMap };
}
