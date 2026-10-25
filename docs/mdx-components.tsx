import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { AdvancedLayersDemo } from "@/components/demos/advanced-layers-demo";
import { ControlsDemo } from "@/components/demos/controls-demo";
import { DrawingDemo } from "@/components/demos/drawing-demo";
import { EventLogDemo } from "@/components/demos/event-log-demo";
import { GeoJsonDemo } from "@/components/demos/geojson-demo";
import { InteractiveMarkerDemo } from "@/components/demos/interactive-marker-demo";
import { LayerDemo } from "@/components/demos/layer-demo";
import { MapControlDemo } from "@/components/demos/map-control-demo";
import {
  Circle,
  Dot,
  GeoJson,
  Layer,
  MapDemo,
  Marker,
  ObjectOverlay,
  Polygon,
  Polyline,
  Popup,
  PredefinedOverlay,
  Rectangle,
  Tag,
} from "@/components/demos/map-demo";
import { ObjectOverlayDemo } from "@/components/demos/object-overlay-demo";
import { OverlayDemo } from "@/components/demos/overlay-demo";
import { PredefinedOverlaysDemo } from "@/components/demos/predefined-overlays-demo";
import { RouteDemo } from "@/components/demos/route-demo";
import { SearchDemo } from "@/components/demos/search-demo";
import { ServicesDemo } from "@/components/demos/services-demo";
import { SpatialDemo } from "@/components/demos/spatial-demo";
import { SphereMapDemo } from "@/components/demos/sphere-map-demo";
import { TagsDemo } from "@/components/demos/tags-demo";
import { UiDemo } from "@/components/demos/ui-demo";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // Interactive demos
    AdvancedLayersDemo,
    // Library components for inline <MapDemo> examples
    Circle,
    ControlsDemo,
    Dot,
    DrawingDemo,
    EventLogDemo,
    GeoJson,
    GeoJsonDemo,
    InteractiveMarkerDemo,
    Layer,
    LayerDemo,
    MapControlDemo,
    MapDemo,
    Marker,
    ObjectOverlay,
    ObjectOverlayDemo,
    OverlayDemo,
    Polygon,
    Polyline,
    Popup,
    PredefinedOverlay,
    PredefinedOverlaysDemo,
    Rectangle,
    RouteDemo,
    SearchDemo,
    ServicesDemo,
    SpatialDemo,
    SphereMapDemo,
    Tag,
    TagsDemo,
    UiDemo,
    ...components,
  };
}
