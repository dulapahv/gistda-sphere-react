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
  center: Location;
  id: string;
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
  name: string;
  position: Location;
}

export interface RouteInfoData {
  distance: string;
  time: string;
}
