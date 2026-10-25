import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentType, ReactNode } from "react";
import { DemoFrame } from "@/components/demos/demo-ui";
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
import { AdvancedLayers } from "@/components/examples/advanced-layers";
import { ClusteredPlaces } from "@/components/examples/clustered-places";
import { ControlPanel } from "@/components/examples/control-panel";
import { CustomControls } from "@/components/examples/custom-controls";
import { DataFormats } from "@/components/examples/data-formats";
import { DeliveryZones } from "@/components/examples/delivery-zones";
import { EventLog } from "@/components/examples/event-log";
import { LayerPicker } from "@/components/examples/layer-picker";
import { LiveOverlays } from "@/components/examples/live-overlays";
import { LiveTracking } from "@/components/examples/live-tracking";
import { LocationPicker } from "@/components/examples/location-picker";
import { MapEvents } from "@/components/examples/map-events";
import { MarkerList } from "@/components/examples/marker-list";
import { MarkerPlacement } from "@/components/examples/marker-placement";
import { PlaceSearch } from "@/components/examples/place-search";
import { PolygonDrawing } from "@/components/examples/polygon-drawing";
import { ProvinceOutline } from "@/components/examples/province-outline";
import { RoutePlanner } from "@/components/examples/route-planner";
import { ServiceCalls } from "@/components/examples/service-calls";
import { SpatialAnalysis } from "@/components/examples/spatial-analysis";
import { StoreLocator } from "@/components/examples/store-locator";
import { TagPicker } from "@/components/examples/tag-picker";
import { UiToggles } from "@/components/examples/ui-toggles";
import { ShowCode } from "@/components/show-code";

/**
 * Turns a standalone example into a live demo: a bordered frame with its
 * own `SphereProvider`. Pages show the example's source under the demo with
 * `<ShowCode>`, so the code always matches what readers see.
 */
function demo(Example: ComponentType): () => ReactNode {
  return function Demo() {
    return (
      <DemoFrame>
        <Example />
      </DemoFrame>
    );
  };
}

/** The live demos, created once so each keeps its identity between renders. */
const DEMOS = {
  AdvancedLayersDemo: demo(AdvancedLayers),
  ControlsDemo: demo(ControlPanel),
  DeliveryZonesDemo: demo(DeliveryZones),
  DrawingDemo: demo(PolygonDrawing),
  EventLogDemo: demo(EventLog),
  GeoJsonDemo: demo(DataFormats),
  InteractiveMarkerDemo: demo(MarkerPlacement),
  LayerDemo: demo(LayerPicker),
  LiveTrackingDemo: demo(LiveTracking),
  LocationPickerDemo: demo(LocationPicker),
  MapControlDemo: demo(CustomControls),
  MarkerClusterDemo: demo(ClusteredPlaces),
  ObjectOverlayDemo: demo(ProvinceOutline),
  OverlayDemo: demo(MarkerList),
  PredefinedOverlaysDemo: demo(LiveOverlays),
  RouteDemo: demo(RoutePlanner),
  SearchDemo: demo(PlaceSearch),
  ServicesDemo: demo(ServiceCalls),
  SpatialDemo: demo(SpatialAnalysis),
  SphereMapDemo: demo(MapEvents),
  StoreLocatorDemo: demo(StoreLocator),
  TagsDemo: demo(TagPicker),
  UiDemo: demo(UiToggles),
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // Interactive demos, each the example file shown in its "Show code"
    ...DEMOS,
    // Library components for inline <MapDemo> examples
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
    ShowCode,
    Tag,
    ...components,
  };
}
