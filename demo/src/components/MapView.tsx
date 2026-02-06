import {
  Circle,
  Dot,
  type Location,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  SphereMap,
} from "gistda-sphere-react";
import { getShapeColor, LOCATIONS } from "../constants";
import type { UseDrawingReturn } from "../hooks";
import type { SearchMarkerData } from "../types";

interface MapViewProps {
  drawing: UseDrawingReturn;
  routeOrigin: Location | null;
  routeDestination: Location | null;
  searchMarker: SearchMarkerData | null;
  settingRoutePoint: "origin" | "destination" | null;
  center: Location | null;
  onZoom: (zoom: number) => void;
  onLocation: (center: Location) => void;
  onClick: (location: Location) => void;
  onDoubleClick: () => void;
}

export function MapView({
  drawing,
  routeOrigin,
  routeDestination,
  searchMarker,
  settingRoutePoint,
  center,
  onZoom,
  onLocation,
  onClick,
  onDoubleClick,
}: MapViewProps) {
  return (
    <div className="map-container">
      <SphereMap
        center={center || LOCATIONS.bangkok}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onLocation={onLocation}
        onZoom={onZoom}
        zoom={10}
      >
        {drawing.markers.map((marker, i) => (
          <Marker
            detail={`${marker.position.lat.toFixed(4)}, ${marker.position.lon.toFixed(4)}`}
            draggable
            key={marker.id}
            onDrop={(_, newPos) => drawing.updateMarker(marker.id, newPos)}
            position={marker.position}
            title={`Marker ${i + 1}`}
          />
        ))}

        {drawing.dots.map((dot, i) => (
          <Dot
            draggable
            key={dot.id}
            lineColor={getShapeColor(i)}
            lineWidth={15}
            onDrop={(_, newPos) => drawing.updateDot(dot.id, newPos)}
            position={dot.position}
            title={`Dot ${i + 1}`}
          />
        ))}

        {drawing.polygons.map((polygon, i) => (
          <Polygon
            fillColor={getShapeColor(i)}
            key={polygon.id}
            lineColor={getShapeColor(i).replace("0.6", "1")}
            lineWidth={2}
            positions={polygon.positions}
            title={`Polygon ${i + 1}`}
          />
        ))}

        {drawing.polygonPoints.length >= 2 && (
          <Polyline
            lineColor="rgba(255, 0, 0, 0.8)"
            lineWidth={2}
            positions={[...drawing.polygonPoints, drawing.polygonPoints[0]]}
          />
        )}

        {drawing.polylines.map((polyline, i) => (
          <Polyline
            key={polyline.id}
            lineColor={getShapeColor(i + 3).replace("0.6", "1")}
            lineWidth={3}
            positions={polyline.positions}
            title={`Line ${i + 1}`}
          />
        ))}

        {drawing.polylinePoints.length >= 1 && (
          <Polyline
            lineColor="rgba(0, 150, 255, 0.8)"
            lineWidth={2}
            positions={drawing.polylinePoints}
          />
        )}

        {drawing.circles.map((circle, i) => (
          <Circle
            center={circle.center}
            fillColor={getShapeColor(i + 2)}
            key={circle.id}
            lineColor={getShapeColor(i + 2).replace("0.6", "1")}
            lineWidth={2}
            radius={circle.radius}
            title={`Circle ${i + 1}`}
          />
        ))}

        {drawing.rectangles.map((rect, i) => (
          <Rectangle
            fillColor={getShapeColor(i + 4)}
            key={rect.id}
            lineColor={getShapeColor(i + 4).replace("0.6", "1")}
            lineWidth={2}
            position={rect.position}
            size={rect.size}
            title={`Rectangle ${i + 1}`}
          />
        ))}

        {drawing.circleCenter && (
          <Marker
            detail="Click to set radius"
            position={drawing.circleCenter}
            title="Circle Center"
          />
        )}

        {drawing.rectangleCorner && (
          <Marker
            detail="Click opposite corner"
            position={drawing.rectangleCorner}
            title="Rectangle Corner"
          />
        )}

        {routeOrigin && <Marker position={routeOrigin} title="Origin" />}

        {routeDestination && (
          <Marker position={routeDestination} title="Destination" />
        )}

        {searchMarker && (
          <Marker position={searchMarker.position} title={searchMarker.name} />
        )}

        {drawing.selectedPopup &&
          drawing.mode === "none" &&
          !settingRoutePoint && (
            <Popup
              detail={`${drawing.selectedPopup.lat.toFixed(6)}, ${drawing.selectedPopup.lon.toFixed(6)}`}
              onClose={drawing.closePopup}
              position={drawing.selectedPopup}
              title="Location"
            />
          )}
      </SphereMap>
    </div>
  );
}
