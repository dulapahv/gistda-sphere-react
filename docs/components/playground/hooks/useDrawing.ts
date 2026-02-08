import type { Location } from "gistda-sphere-react";
import { useCallback, useState } from "react";
import type { DrawingMode } from "../constants";
import type {
  CircleData,
  DotData,
  MarkerData,
  PolygonData,
  RectangleData,
} from "../types";

export interface DrawingState {
  mode: DrawingMode;
  markers: MarkerData[];
  polygons: PolygonData[];
  polylines: PolygonData[];
  circles: CircleData[];
  dots: DotData[];
  rectangles: RectangleData[];
  polygonPoints: Location[];
  polylinePoints: Location[];
  circleCenter: Location | null;
  rectangleCorner: Location | null;
  selectedPopup: Location | null;
}

export interface UseDrawingReturn extends DrawingState {
  setMode: (mode: DrawingMode) => void;
  handleClick: (location: Location) => boolean;
  handleDoubleClick: () => void;
  clearAll: () => void;
  updateMarker: (id: string, position: Location) => void;
  updateDot: (id: string, position: Location) => void;
  closePopup: () => void;
  totalShapes: number;
}

/** Manages drawing state for markers, polygons, polylines, circles, dots, and rectangles. */
export function useDrawing(): UseDrawingReturn {
  const [mode, setMode] = useState<DrawingMode>("none");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [polylines, setPolylines] = useState<PolygonData[]>([]);
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [dots, setDots] = useState<DotData[]>([]);
  const [rectangles, setRectangles] = useState<RectangleData[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Location[]>([]);
  const [polylinePoints, setPolylinePoints] = useState<Location[]>([]);
  const [circleCenter, setCircleCenter] = useState<Location | null>(null);
  const [rectangleCorner, setRectangleCorner] = useState<Location | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<Location | null>(null);

  const handleClick = useCallback(
    (location: Location): boolean => {
      switch (mode) {
        case "marker":
          setMarkers((prev) => [
            ...prev,
            { id: `marker-${Date.now()}`, position: location },
          ]);
          return true;
        case "dot":
          setDots((prev) => [
            ...prev,
            { id: `dot-${Date.now()}`, position: location },
          ]);
          return true;
        case "polygon":
          setPolygonPoints((prev) => [...prev, location]);
          return true;
        case "polyline":
          setPolylinePoints((prev) => [...prev, location]);
          return true;
        case "circle":
          if (circleCenter) {
            const dx = location.lon - circleCenter.lon;
            const dy = location.lat - circleCenter.lat;
            const radius = Math.sqrt(dx * dx + dy * dy);
            setCircles((prev) => [
              ...prev,
              { id: `circle-${Date.now()}`, center: circleCenter, radius },
            ]);
            setCircleCenter(null);
          } else {
            setCircleCenter(location);
          }
          return true;
        case "rectangle":
          if (rectangleCorner) {
            const width = Math.abs(location.lon - rectangleCorner.lon);
            const height = Math.abs(location.lat - rectangleCorner.lat);
            const minLon = Math.min(location.lon, rectangleCorner.lon);
            const maxLat = Math.max(location.lat, rectangleCorner.lat);
            setRectangles((prev) => [
              ...prev,
              {
                id: `rect-${Date.now()}`,
                position: { lon: minLon, lat: maxLat },
                size: { width, height },
              },
            ]);
            setRectangleCorner(null);
          } else {
            setRectangleCorner(location);
          }
          return true;
        default:
          setSelectedPopup(location);
          return false;
      }
    },
    [mode, circleCenter, rectangleCorner]
  );

  const handleDoubleClick = useCallback(() => {
    if (mode === "polygon" && polygonPoints.length >= 3) {
      setPolygons((prev) => [
        ...prev,
        { id: `polygon-${Date.now()}`, positions: polygonPoints },
      ]);
      setPolygonPoints([]);
    } else if (mode === "polyline" && polylinePoints.length >= 2) {
      setPolylines((prev) => [
        ...prev,
        { id: `polyline-${Date.now()}`, positions: polylinePoints },
      ]);
      setPolylinePoints([]);
    }
  }, [mode, polygonPoints, polylinePoints]);

  const clearAll = useCallback(() => {
    setMarkers([]);
    setPolygons([]);
    setPolylines([]);
    setCircles([]);
    setDots([]);
    setRectangles([]);
    setPolygonPoints([]);
    setPolylinePoints([]);
    setCircleCenter(null);
    setRectangleCorner(null);
    setSelectedPopup(null);
  }, []);

  const updateMarker = useCallback((id: string, position: Location) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, position } : m))
    );
  }, []);

  const updateDot = useCallback((id: string, position: Location) => {
    setDots((prev) => prev.map((d) => (d.id === id ? { ...d, position } : d)));
  }, []);

  const closePopup = useCallback(() => {
    setSelectedPopup(null);
  }, []);

  const totalShapes =
    markers.length +
    polygons.length +
    polylines.length +
    circles.length +
    dots.length +
    rectangles.length;

  return {
    mode,
    markers,
    polygons,
    polylines,
    circles,
    dots,
    rectangles,
    polygonPoints,
    polylinePoints,
    circleCenter,
    rectangleCorner,
    selectedPopup,
    setMode,
    handleClick,
    handleDoubleClick,
    clearAll,
    updateMarker,
    updateDot,
    closePopup,
    totalShapes,
  };
}
