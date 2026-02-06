import type { Location } from "gistda-sphere-react";

export interface MarkerData {
  id: string;
  position: Location;
}

export interface PolygonData {
  id: string;
  positions: Location[];
}

export interface CircleData {
  id: string;
  center: Location;
  radius: number;
}

export interface DotData {
  id: string;
  position: Location;
}

export interface RectangleData {
  id: string;
  position: Location;
  size: { width: number; height: number };
}

export interface SearchMarkerData {
  position: Location;
  name: string;
}

export interface RouteInfoData {
  distance: string;
  time: string;
}
