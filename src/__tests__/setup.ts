import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * Creates a mock Sphere API for testing.
 * This mock simulates the behavior of the GISTDA Sphere API.
 */
type EventHandler = (data?: unknown) => void;

export function createMockSphereApi() {
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
        value !== undefined ? mockMap : 10
      ),
    zoomRange: vi.fn().mockReturnThis(),
    location: vi
      .fn()
      .mockImplementation((value?: object) =>
        value !== undefined ? mockMap : { lon: 100.5, lat: 13.75 }
      ),
    bound: vi.fn().mockReturnThis(),
    move: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnValue("th"),
    rotate: vi
      .fn()
      .mockImplementation((value?: number) =>
        value !== undefined ? mockMap : 0
      ),
    pitch: vi
      .fn()
      .mockImplementation((value?: number) =>
        value !== undefined ? mockMap : 0
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

// Helper to set up global Sphere mock
export function setupSphereGlobal() {
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
