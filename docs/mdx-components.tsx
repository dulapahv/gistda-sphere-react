import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ControlsDemo } from "@/components/demos/controls-demo";
import { DrawingDemo } from "@/components/demos/drawing-demo";
import { EventLogDemo } from "@/components/demos/event-log-demo";
import { InteractiveMarkerDemo } from "@/components/demos/interactive-marker-demo";
import { LayerDemo } from "@/components/demos/layer-demo";
import {
  Circle,
  Dot,
  MapDemo,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
} from "@/components/demos/map-demo";
import { OverlayDemo } from "@/components/demos/overlay-demo";
import { PredefinedOverlaysDemo } from "@/components/demos/predefined-overlays-demo";
import { RouteDemo } from "@/components/demos/route-demo";
import { SearchDemo } from "@/components/demos/search-demo";
import { SphereMapDemo } from "@/components/demos/sphere-map-demo";
import { TagsDemo } from "@/components/demos/tags-demo";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Circle,
    // Interactive demos
    ControlsDemo,
    Dot,
    DrawingDemo,
    EventLogDemo,
    InteractiveMarkerDemo,
    LayerDemo,
    // Map demo components
    MapDemo,
    Marker,
    OverlayDemo,
    Polygon,
    Polyline,
    Popup,
    PredefinedOverlaysDemo,
    Rectangle,
    RouteDemo,
    SearchDemo,
    SphereMapDemo,
    TagsDemo,
    ...components,
  };
}
