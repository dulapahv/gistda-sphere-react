import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Circle } from "../components/Circle";
import { Dot } from "../components/Dot";
import { Polygon } from "../components/Polygon";
import { Polyline } from "../components/Polyline";
import { Popup } from "../components/Popup";
import { Rectangle } from "../components/Rectangle";
import { SphereMap } from "../components/SphereMap";
import { SphereProvider } from "../context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("Geometry Components", () => {
  const { mockSphere, mockMap } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  function renderInMap(children: React.ReactNode) {
    return render(
      <SphereProvider apiKey="test-key">
        <SphereMap>{children}</SphereMap>
      </SphereProvider>
    );
  }

  describe("Circle", () => {
    let mockCircleInstance: ReturnType<typeof mockSphere.Circle>;

    beforeEach(() => {
      mockCircleInstance = mockSphere.Circle();
      mockSphere.Circle.mockImplementation(function () {
        return mockCircleInstance;
      });
    });

    it("creates circle with center and radius", async () => {
      renderInMap(
        <Circle
          center={{ lon: 100.5, lat: 13.75 }}
          fillColor="rgba(0,100,255,0.3)"
          radius={0.05}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Circle).toHaveBeenCalledWith(
          { lon: 100.5, lat: 13.75 },
          0.05,
          expect.objectContaining({ fillColor: "rgba(0,100,255,0.3)" })
        );
      });
    });

    it("adds circle to map overlays", async () => {
      renderInMap(<Circle center={{ lon: 100.5, lat: 13.75 }} radius={0.05} />);

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockCircleInstance);
      });
    });

    it("removes circle on unmount", async () => {
      const { unmount } = renderInMap(
        <Circle center={{ lon: 100.5, lat: 13.75 }} radius={0.05} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalled();
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(mockCircleInstance);
    });

    it("binds event handlers", async () => {
      const onClick = vi.fn();

      renderInMap(
        <Circle
          center={{ lon: 100.5, lat: 13.75 }}
          onClick={onClick}
          radius={0.05}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayClick",
          expect.any(Function)
        );
      });
    });
  });

  describe("Polygon", () => {
    let mockPolygonInstance: ReturnType<typeof mockSphere.Polygon>;

    const positions = [
      { lon: 100.45, lat: 13.8 },
      { lon: 100.55, lat: 13.8 },
      { lon: 100.5, lat: 13.7 },
    ];

    beforeEach(() => {
      mockPolygonInstance = mockSphere.Polygon();
      mockSphere.Polygon.mockImplementation(function () {
        return mockPolygonInstance;
      });
      mockSphere.Polygon.mockClear();
    });

    it("creates polygon with positions", async () => {
      renderInMap(
        <Polygon fillColor="rgba(255,0,0,0.3)" positions={positions} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Polygon).toHaveBeenCalledWith(
          positions,
          expect.objectContaining({ fillColor: "rgba(255,0,0,0.3)" })
        );
      });
    });

    it("adds polygon to map and removes on unmount", async () => {
      const { unmount } = renderInMap(<Polygon positions={positions} />);

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockPolygonInstance);
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(mockPolygonInstance);
    });

    it("does not create polygon with fewer than 3 positions", async () => {
      renderInMap(
        <Polygon
          positions={[
            { lon: 100.45, lat: 13.8 },
            { lon: 100.55, lat: 13.8 },
          ]}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      // Wait a tick and verify constructor was not called
      await new Promise((r) => setTimeout(r, 50));
      expect(mockSphere.Polygon).not.toHaveBeenCalled();
    });

    it("binds drag events", async () => {
      renderInMap(
        <Polygon
          draggable
          onDrag={vi.fn()}
          onDrop={vi.fn()}
          positions={positions}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayDrag",
          expect.any(Function)
        );
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayDrop",
          expect.any(Function)
        );
      });
    });
  });

  describe("Polyline", () => {
    let mockPolylineInstance: ReturnType<typeof mockSphere.Polyline>;

    const positions = [
      { lon: 100.3, lat: 13.7 },
      { lon: 100.5, lat: 13.8 },
    ];

    beforeEach(() => {
      mockPolylineInstance = mockSphere.Polyline();
      mockSphere.Polyline.mockImplementation(function () {
        return mockPolylineInstance;
      });
      mockSphere.Polyline.mockClear();
    });

    it("creates polyline with positions", async () => {
      renderInMap(
        <Polyline lineColor="blue" lineWidth={3} positions={positions} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Polyline).toHaveBeenCalledWith(
          positions,
          expect.objectContaining({ lineColor: "blue", lineWidth: 3 })
        );
      });
    });

    it("adds polyline to map and removes on unmount", async () => {
      const { unmount } = renderInMap(<Polyline positions={positions} />);

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockPolylineInstance);
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(
        mockPolylineInstance
      );
    });

    it("does not create polyline with fewer than 2 positions", async () => {
      renderInMap(<Polyline positions={[{ lon: 100.3, lat: 13.7 }]} />);

      act(() => {
        mockMap._triggerReady();
      });

      await new Promise((r) => setTimeout(r, 50));
      expect(mockSphere.Polyline).not.toHaveBeenCalled();
    });
  });

  describe("Rectangle", () => {
    let mockRectangleInstance: ReturnType<typeof mockSphere.Rectangle>;

    beforeEach(() => {
      mockRectangleInstance = mockSphere.Rectangle();
      mockSphere.Rectangle.mockImplementation(function () {
        return mockRectangleInstance;
      });
    });

    it("creates rectangle with position and size", async () => {
      renderInMap(
        <Rectangle
          fillColor="rgba(0,255,0,0.3)"
          position={{ lon: 100.5, lat: 13.75 }}
          size={{ width: 0.1, height: 0.05 }}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Rectangle).toHaveBeenCalledWith(
          { lon: 100.5, lat: 13.75 },
          { width: 0.1, height: 0.05 },
          expect.objectContaining({ fillColor: "rgba(0,255,0,0.3)" })
        );
      });
    });

    it("adds rectangle to map and removes on unmount", async () => {
      const { unmount } = renderInMap(
        <Rectangle
          position={{ lon: 100.5, lat: 13.75 }}
          size={{ width: 0.1, height: 0.05 }}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(
          mockRectangleInstance
        );
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(
        mockRectangleInstance
      );
    });
  });

  describe("Dot", () => {
    let mockDotInstance: ReturnType<typeof mockSphere.Dot>;

    beforeEach(() => {
      mockDotInstance = mockSphere.Dot();
      mockSphere.Dot.mockImplementation(function () {
        return mockDotInstance;
      });
    });

    it("creates dot with position", async () => {
      renderInMap(
        <Dot
          lineColor="red"
          lineWidth={10}
          position={{ lon: 100.5, lat: 13.75 }}
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Dot).toHaveBeenCalledWith(
          { lon: 100.5, lat: 13.75 },
          expect.objectContaining({ lineWidth: 10, lineColor: "red" })
        );
      });
    });

    it("adds dot to map and removes on unmount", async () => {
      const { unmount } = renderInMap(
        <Dot position={{ lon: 100.5, lat: 13.75 }} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockDotInstance);
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(mockDotInstance);
    });

    it("binds drop event for draggable dot", async () => {
      renderInMap(
        <Dot draggable onDrop={vi.fn()} position={{ lon: 100.5, lat: 13.75 }} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "overlayDrop",
          expect.any(Function)
        );
      });
    });
  });

  describe("Popup", () => {
    let mockPopupInstance: ReturnType<typeof mockSphere.Popup>;

    beforeEach(() => {
      mockPopupInstance = mockSphere.Popup();
      mockSphere.Popup.mockImplementation(function () {
        return mockPopupInstance;
      });
    });

    it("creates popup with position and title", async () => {
      renderInMap(
        <Popup
          detail="Details here"
          position={{ lon: 100.5, lat: 13.75 }}
          title="Info"
        />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockSphere.Popup).toHaveBeenCalledWith(
          { lon: 100.5, lat: 13.75 },
          expect.objectContaining({ title: "Info", detail: "Details here" })
        );
      });
    });

    it("adds popup to map and removes on unmount", async () => {
      const { unmount } = renderInMap(
        <Popup position={{ lon: 100.5, lat: 13.75 }} title="Test" />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Overlays.add).toHaveBeenCalledWith(mockPopupInstance);
      });

      unmount();

      expect(mockMap.Overlays.remove).toHaveBeenCalledWith(mockPopupInstance);
    });

    it("binds popupClose event", async () => {
      renderInMap(
        <Popup onClose={vi.fn()} position={{ lon: 100.5, lat: 13.75 }} />
      );

      act(() => {
        mockMap._triggerReady();
      });

      await waitFor(() => {
        expect(mockMap.Event.bind).toHaveBeenCalledWith(
          "popupClose",
          expect.any(Function)
        );
      });
    });
  });
});
