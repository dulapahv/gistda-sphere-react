import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { Circle } from "@/components/Circle";
import { Dot } from "@/components/Dot";
import { Marker } from "@/components/Marker";
import { Polygon } from "@/components/Polygon";
import { Polyline } from "@/components/Polyline";
import { Rectangle } from "@/components/Rectangle";
import { renderInMap } from "./helpers";
import { createMockSphereApi } from "./setup";

/**
 * Sphere fires `overlayClick` as `(overlay, location)` and the other overlay
 * events as `(overlay)`. These tests fire events exactly like that and check
 * that each component's callbacks run — and only for its own overlay.
 */
describe("overlay events", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const location = { lat: 13.7, lon: 100.5 };
  const square = [
    { lat: 13.8, lon: 100.4 },
    { lat: 13.8, lon: 100.6 },
    { lat: 13.6, lon: 100.6 },
  ];

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  type Handler = Mock<(...args: unknown[]) => void>;
  interface Callbacks {
    onClick: Handler;
    onDrag: Handler;
    onHover: Handler;
    onLeave: Handler;
  }

  const cases: Array<{
    constructorName:
      | "Marker"
      | "Polygon"
      | "Polyline"
      | "Circle"
      | "Dot"
      | "Rectangle";
    element: (callbacks: Callbacks) => ReactElement;
  }> = [
    {
      constructorName: "Marker",
      element: (cb) => <Marker position={location} {...cb} />,
    },
    {
      constructorName: "Polygon",
      element: (cb) => <Polygon positions={square} {...cb} />,
    },
    {
      constructorName: "Polyline",
      element: (cb) => <Polyline positions={square} {...cb} />,
    },
    {
      constructorName: "Circle",
      element: (cb) => <Circle center={location} radius={0.1} {...cb} />,
    },
    {
      constructorName: "Dot",
      element: (cb) => <Dot position={location} {...cb} />,
    },
    {
      constructorName: "Rectangle",
      element: (cb) => (
        <Rectangle position={location} size={{ height: 1, width: 1 }} {...cb} />
      ),
    },
  ];

  for (const { constructorName, element } of cases) {
    it(`${constructorName}: forwards clicks, drags and hovers for its own overlay`, () => {
      const callbacks: Callbacks = {
        onClick: vi.fn(),
        onDrag: vi.fn(),
        onHover: vi.fn(),
        onLeave: vi.fn(),
      };
      renderInMap(mockMap, element(callbacks));

      const overlay = mockSphere[constructorName].mock.results[0]?.value;
      expect(overlay).toBeDefined();

      act(() => {
        mockMap.Event.fire("overlayClick", overlay, location);
        mockMap.Event.fire("overlayDrag", overlay);
        mockMap.Event.fire("overlayHover", overlay);
        mockMap.Event.fire("overlayLeave", overlay);
      });

      expect(callbacks.onClick).toHaveBeenCalledWith(overlay, location);
      expect(callbacks.onDrag).toHaveBeenCalledWith(overlay);
      expect(callbacks.onHover).toHaveBeenCalledWith(overlay);
      expect(callbacks.onLeave).toHaveBeenCalledWith(overlay);
    });

    it(`${constructorName}: ignores events for other overlays`, () => {
      const callbacks: Callbacks = {
        onClick: vi.fn(),
        onDrag: vi.fn(),
        onHover: vi.fn(),
        onLeave: vi.fn(),
      };
      renderInMap(mockMap, element(callbacks));
      const someoneElse = {};

      act(() => {
        mockMap.Event.fire("overlayClick", someoneElse, location);
        mockMap.Event.fire("overlayHover", someoneElse);
      });

      expect(callbacks.onClick).not.toHaveBeenCalled();
      expect(callbacks.onHover).not.toHaveBeenCalled();
    });
  }

  it("Marker and Dot report the drop location", () => {
    const onMarkerDrop = vi.fn();
    const onDotDrop = vi.fn();
    renderInMap(
      mockMap,
      <>
        <Marker onDrop={onMarkerDrop} position={location} />
        <Dot onDrop={onDotDrop} position={location} />
      </>
    );
    const marker = mockSphere.Marker.mock.results[0]?.value;
    const dot = mockSphere.Dot.mock.results[0]?.value;
    marker.location.mockReturnValue({ lat: 14, lon: 101 });
    dot.location.mockReturnValue({ lat: 15, lon: 102 });

    act(() => {
      mockMap.Event.fire("overlayDrop", marker);
      mockMap.Event.fire("overlayDrop", dot);
    });

    expect(onMarkerDrop).toHaveBeenCalledWith(marker, { lat: 14, lon: 101 });
    expect(onDotDrop).toHaveBeenCalledWith(dot, { lat: 15, lon: 102 });
  });

  it("unbinds overlay events on unmount", () => {
    const { unmount } = renderInMap(
      mockMap,
      <Marker onClick={vi.fn()} position={location} />
    );
    unmount();
    for (const name of [
      "overlayClick",
      "overlayDrag",
      "overlayDrop",
      "overlayHover",
      "overlayLeave",
    ]) {
      expect(mockMap.Event.unbind).toHaveBeenCalledWith(
        name,
        expect.any(Function)
      );
    }
  });
});
