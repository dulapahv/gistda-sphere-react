# gistda-sphere-react

> **Disclaimer**: This is an **unofficial** community project and is not affiliated with, endorsed by, or supported by GISTDA (Geo-Informatics and Space Technology Development Agency). For official documentation and support, please visit [sphere.gistda.or.th](https://sphere.gistda.or.th/).

> **Note**: This project is currently under active development. APIs may change between releases.

A React wrapper for the [GISTDA Sphere Map API](https://sphere.gistda.or.th/). Build interactive maps of Thailand with full TypeScript support.

- [gistda-sphere-react](#gistda-sphere-react)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Getting an API Key](#getting-an-api-key)
  - [Components](#components)
    - [SphereProvider](#sphereprovider)
    - [SphereMap](#spheremap)
    - [Marker](#marker)
    - [Polygon](#polygon)
    - [Polyline](#polyline)
    - [Circle](#circle)
    - [Popup](#popup)
    - [Dot](#dot)
    - [Rectangle](#rectangle)
    - [Layer](#layer)
      - [Layer Types](#layer-types)
  - [Hooks](#hooks)
    - [useMap](#usemap)
    - [useSphere](#usesphere)
    - [useMapControls](#usemapcontrols)
    - [Event Hooks](#event-hooks)
    - [useSearch](#usesearch)
    - [useRoute](#useroute)
    - [useTags](#usetags)
    - [Overlay Collection Hooks](#overlay-collection-hooks)
      - [useMarkers](#usemarkers)
      - [usePolygons, usePolylines, useCircles](#usepolygons-usepolylines-usecircles)
      - [useOverlays](#useoverlays)
  - [Built-in Layers](#built-in-layers)
  - [Predefined Overlays](#predefined-overlays)
  - [Color Filters](#color-filters)
  - [Ref APIs](#ref-apis)
    - [SphereMapRef](#spheremapref)
    - [MarkerRef](#markerref)
    - [PolygonRef](#polygonref)
    - [PolylineRef](#polylineref)
    - [CircleRef](#circleref)
    - [PopupRef](#popupref)
    - [DotRef](#dotref)
    - [RectangleRef](#rectangleref)
  - [TypeScript](#typescript)
    - [Icon Type](#icon-type)
    - [PopupOptions Type](#popupoptions-type)
  - [Examples](#examples)
    - [Adding Elements Programmatically](#adding-elements-programmatically)
    - [Interactive Marker Placement](#interactive-marker-placement)
    - [Drawing Polygons](#drawing-polygons)
    - [Sidebar with Map Controls](#sidebar-with-map-controls)
    - [Custom WMS Layer](#custom-wms-layer)
    - [Routing between Locations](#routing-between-locations)
    - [Searching for POIs](#searching-for-pois)
    - [Displaying Tags on the Map](#displaying-tags-on-the-map)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)

## Installation

```bash
npm install gistda-sphere-react
```

## Quick Start

```tsx
import { SphereProvider, SphereMap, Marker } from 'gistda-sphere-react';

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <SphereMap
        center={{ lon: 100.5018, lat: 13.7563 }}
        zoom={10}
        style={{ width: '100%', height: '500px' }}
      >
        <Marker
          position={{ lon: 100.5018, lat: 13.7563 }}
          title="Bangkok"
          detail="Capital of Thailand"
        />
      </SphereMap>
    </SphereProvider>
  );
}
```

## Getting an API Key

1. Visit [sphere.gistda.or.th](https://sphere.gistda.or.th/)
2. Register for an account
3. Create a new API key and register your domain(s)

> **Note**: Register `localhost` for local development.

---

## Components

### SphereProvider

Wraps your app and loads the Sphere API script. Must be an ancestor of all other Sphere components.

```tsx
<SphereProvider apiKey="YOUR_API_KEY" onLoad={() => console.log('API loaded')}>
  {/* Your app */}
</SphereProvider>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | - | Your GISTDA Sphere API key |
| `children` | `ReactNode` | Yes | - | Child components |
| `scriptUrl` | `string` | No | Official Sphere API URL | Custom URL for the Sphere API script |
| `onLoad` | `() => void` | No | - | Called when the API script finishes loading |
| `onError` | `(error: Error) => void` | No | - | Called if the API script fails to load |

---

### SphereMap

The map container component. All overlay components (Marker, Polygon, etc.) must be placed inside.

```tsx
<SphereMap
  center={{ lon: 100.5018, lat: 13.7563 }}
  zoom={10}
  style={{ width: '100%', height: '500px' }}
  onClick={(location) => console.log('Clicked:', location)}
>
  {/* Markers, Polygons, etc. */}
</SphereMap>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `center` | `Location` | No | Bangkok (`{ lon: 100.49, lat: 13.72 }`) | Initial map center coordinates |
| `zoom` | `number` | No | `7` | Initial zoom level (1-22) |
| `zoomRange` | `Range` | No | All zoom levels | Allowed zoom range (`{ min, max }`) |
| `language` | `string` | No | `"th"` | Map label language (ISO 639-1, e.g. `"th"`, `"en"`) |
| `input` | `boolean` | No | `true` | Allow user input (click, drag, scroll) |
| `lastView` | `boolean` | No | `false` | Restore last location/zoom from local storage |
| `ui` | `"Full" \| "Mobile" \| "None"` | No | Fit screen size | UI component mode |
| `filter` | `FilterType` | No | `"None"` | Initial color filter |
| `rotate` | `number` | No | `0` | Initial rotation angle in degrees (clockwise from north) |
| `pitch` | `number` | No | `0` | Initial pitch angle in degrees (0 = looking straight down) |
| `style` | `CSSProperties` | No | - | CSS styles for the map container |
| `className` | `string` | No | - | CSS class for the map container |
| `id` | `string` | No | - | HTML id attribute for the map container |
| `ref` | `Ref<SphereMapRef>` | No | - | Ref for imperative map control (see [SphereMapRef](#spheremapref)) |
| `children` | `ReactNode` | No | - | Overlay components to render on the map |
| `onReady` | `(map: SphereMapInstance) => void` | No | - | Called when the map is initialized and ready |
| `onClick` | `(location: Location) => void` | No | - | Called when the map is clicked |
| `onDoubleClick` | `(location: Location) => void` | No | - | Called when the map is double-clicked |
| `onZoom` | `(zoom: number) => void` | No | - | Called when the zoom level changes |
| `onLocation` | `(location: Location) => void` | No | - | Called when the map center changes |
| `onRotate` | `(angle: number) => void` | No | - | Called when the map rotation changes |
| `onPitch` | `(angle: number) => void` | No | - | Called when the map pitch changes |
| `onDrag` | `() => void` | No | - | Called when the user starts dragging the map |
| `onDrop` | `() => void` | No | - | Called when the user stops dragging the map |
| `onMouseMove` | `(location: Location) => void` | No | - | Called when the mouse moves over the map |
| `onIdle` | `() => void` | No | - | Called when the map becomes idle (no input, animation, or tile loading) |
| `onError` | `(error: Error) => void` | No | - | Called when an error occurs |

> **Important**: The map container must have an explicit height. Without it, the `<div>` collapses to 0px.

---

### Marker

Displays a point marker on the map with optional popup, custom icon, and drag support.

```tsx
<Marker
  position={{ lon: 100.5018, lat: 13.7563 }}
  title="Bangkok"
  detail="Capital of Thailand"
  draggable
  onDrop={(marker, newPosition) => console.log('Moved to:', newPosition)}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `Location` | Yes | - | Marker coordinates (`{ lon, lat }`) |
| `ref` | `Ref<MarkerRef>` | No | - | Ref for imperative control (see [MarkerRef](#markerref)) |
| `icon` | `Icon` | No | Default red pin | Custom icon (see [Icon type](#icon)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `popup` | `PopupOptions` | No | - | Popup configuration (overrides `detail`) |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the marker is visible (`{ min, max }`) |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this marker |
| `zIndex` | `number` | No | `0` | Stacking order (higher values appear on top) |
| `rotate` | `number` | No | `0` | Rotation angle in degrees (clockwise) |
| `onClick` | `(marker: SphereMarker) => void` | No | - | Called when the marker is clicked |
| `onDrag` | `(marker: SphereMarker) => void` | No | - | Called while the marker is being dragged |
| `onDrop` | `(marker: SphereMarker, location: Location) => void` | No | - | Called when the marker is dropped after dragging |
| `onHover` | `(marker: SphereMarker) => void` | No | - | Called when the mouse enters the marker |
| `onLeave` | `(marker: SphereMarker) => void` | No | - | Called when the mouse leaves the marker |

**Custom icon example:**

```tsx
<Marker
  position={{ lon: 100.5, lat: 13.75 }}
  icon={{
    url: '/my-icon.png',
    size: { width: 32, height: 32 },
    offset: { x: 16, y: 32 }
  }}
/>
```

**HTML icon example:**

```tsx
<Marker
  position={{ lon: 100.5, lat: 13.75 }}
  icon={{
    html: '<div style="background: red; width: 20px; height: 20px; border-radius: 50%;"></div>',
    offset: { x: 10, y: 10 }
  }}
/>
```

---

### Polygon

Draws a filled polygon on the map.

```tsx
<Polygon
  positions={[
    { lon: 100.45, lat: 13.8 },
    { lon: 100.55, lat: 13.8 },
    { lon: 100.50, lat: 13.7 },
  ]}
  fillColor="rgba(255, 0, 0, 0.3)"
  lineColor="red"
  lineWidth={2}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `positions` | `Location[]` | Yes (min 3) | - | Array of vertices defining the polygon |
| `ref` | `Ref<PolygonRef>` | No | - | Ref for imperative control (see [PolygonRef](#polygonref)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `label` | `string` | No | - | Text label displayed at the polygon center |
| `labelOptions` | `MarkerOptions` | No | - | Options for the label marker (overrides `label` visible range) |
| `popup` | `PopupOptions` | No | - | Popup configuration (overrides `detail`) |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the polygon is visible |
| `lineWidth` | `number` | No | `3` | Border width in pixels |
| `lineColor` | `string` | No | Preset color | Border color (any CSS color value) |
| `fillColor` | `string` | No | Preset color | Fill color (any CSS color value) |
| `lineStyle` | `"Solid" \| "Dashed" \| "Dot"` | No | `"Solid"` | Border line style |
| `pivot` | `Location` | No | Center of geometry | Rotation pivot point and label location |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this polygon |
| `pointer` | `boolean` | No | `false` | Show draggable pointer on hover |
| `editable` | `boolean` | No | `false` | Allow vertex editing |
| `zIndex` | `number` | No | `0` | Stacking order |
| `onClick` | `(polygon: SpherePolygon) => void` | No | - | Called when the polygon is clicked |
| `onDrag` | `(polygon: SpherePolygon) => void` | No | - | Called while the polygon is being dragged |
| `onDrop` | `(polygon: SpherePolygon) => void` | No | - | Called when the polygon is dropped after dragging |

---

### Polyline

Draws a line on the map connecting a series of points.

```tsx
<Polyline
  positions={[
    { lon: 100.3, lat: 13.7 },
    { lon: 100.5, lat: 13.8 },
    { lon: 100.7, lat: 13.7 },
  ]}
  lineColor="blue"
  lineWidth={3}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `positions` | `Location[]` | Yes (min 2) | - | Array of points defining the line |
| `ref` | `Ref<PolylineRef>` | No | - | Ref for imperative control (see [PolylineRef](#polylineref)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `label` | `string` | No | - | Text label displayed at the line center |
| `labelOptions` | `MarkerOptions` | No | - | Options for the label marker |
| `popup` | `PopupOptions` | No | - | Popup configuration (overrides `detail`) |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the line is visible |
| `lineWidth` | `number` | No | `3` | Line width in pixels |
| `lineColor` | `string` | No | Preset color | Line color (any CSS color value) |
| `lineStyle` | `"Solid" \| "Dashed" \| "Dot"` | No | `"Solid"` | Line style |
| `pivot` | `Location` | No | Center of geometry | Rotation pivot point and label location |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this line |
| `pointer` | `boolean` | No | `false` | Show draggable pointer on hover |
| `zIndex` | `number` | No | `0` | Stacking order |
| `onClick` | `(polyline: SpherePolyline) => void` | No | - | Called when the line is clicked |
| `onDrag` | `(polyline: SpherePolyline) => void` | No | - | Called while the line is being dragged |
| `onDrop` | `(polyline: SpherePolyline) => void` | No | - | Called when the line is dropped after dragging |

---

### Circle

Draws a circle on the map.

```tsx
<Circle
  center={{ lon: 100.5, lat: 13.75 }}
  radius={0.05}
  fillColor="rgba(0, 100, 255, 0.3)"
  lineColor="blue"
  lineWidth={2}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `center` | `Location` | Yes | - | Circle center coordinates |
| `radius` | `number` | Yes | - | Circle radius in degrees |
| `ref` | `Ref<CircleRef>` | No | - | Ref for imperative control (see [CircleRef](#circleref)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `popup` | `PopupOptions` | No | - | Popup configuration (overrides `detail`) |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the circle is visible |
| `lineWidth` | `number` | No | `3` | Border width in pixels |
| `lineColor` | `string` | No | Preset color | Border color (any CSS color value) |
| `fillColor` | `string` | No | Preset color | Fill color (any CSS color value) |
| `lineStyle` | `"Solid" \| "Dashed" \| "Dot"` | No | `"Solid"` | Border line style |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this circle |
| `zIndex` | `number` | No | `0` | Stacking order |
| `onClick` | `(circle: SphereCircle) => void` | No | - | Called when the circle is clicked |
| `onDrag` | `(circle: SphereCircle) => void` | No | - | Called while the circle is being dragged |
| `onDrop` | `(circle: SphereCircle) => void` | No | - | Called when the circle is dropped after dragging |

---

### Popup

Displays an information popup at a specific location on the map.

```tsx
<Popup
  position={{ lon: 100.5, lat: 13.75 }}
  title="Info"
  detail="This is a popup"
  onClose={() => console.log('Popup closed')}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `Location` | Yes | - | Popup coordinates |
| `ref` | `Ref<PopupRef>` | No | - | Ref for imperative control (see [PopupRef](#popupref)) |
| `title` | `string` | No | - | Popup title |
| `detail` | `string` | No | - | Popup detail text (supports HTML) |
| `loadDetail` | `(element: HTMLElement) => void` | No | - | Callback to dynamically load detail content into the popup element |
| `html` | `string` | No | - | Custom HTML content (overrides `detail`) |
| `loadHtml` | `(element: HTMLElement) => void` | No | - | Callback to dynamically load custom HTML content |
| `size` | `Size` | No | Auto | Popup size (`{ width, height }` in pixels) |
| `closable` | `boolean` | No | `true` | Show close button |
| `onClose` | `(popup: SpherePopup) => void` | No | - | Called when the popup is closed |

**Custom HTML popup:**

```tsx
<Popup
  position={{ lon: 100.5, lat: 13.75 }}
  html='<div style="background: #eeeeff; padding: 10px;">Custom content</div>'
/>
```

**Dynamic content loading:**

```tsx
<Popup
  position={{ lon: 100.5, lat: 13.75 }}
  title="Loading..."
  loadDetail={(element) => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => { element.innerHTML = data.description; });
  }}
/>
```

---

### Dot

A simple point geometry on the map (smaller and simpler than Marker).

```tsx
<Dot
  position={{ lon: 100.5, lat: 13.75 }}
  lineWidth={10}
  lineColor="red"
  draggable
  onDrop={(dot, location) => console.log('Dropped at:', location)}
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `Location` | Yes | - | Dot coordinates |
| `ref` | `Ref<DotRef>` | No | - | Ref for imperative control (see [DotRef](#dotref)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the dot is visible |
| `lineWidth` | `number` | No | `3` | Dot size in pixels |
| `lineColor` | `string` | No | Preset color | Dot color (any CSS color value) |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this dot |
| `zIndex` | `number` | No | `0` | Stacking order |
| `onClick` | `(dot: SphereDot) => void` | No | - | Called when the dot is clicked |
| `onDrag` | `(dot: SphereDot) => void` | No | - | Called while the dot is being dragged |
| `onDrop` | `(dot: SphereDot, location: Location) => void` | No | - | Called when the dot is dropped after dragging |

---

### Rectangle

Draws a rectangle on the map.

```tsx
<Rectangle
  position={{ lon: 100.5, lat: 13.75 }}
  size={{ width: 0.1, height: 0.05 }}
  fillColor="rgba(0, 255, 0, 0.3)"
  lineColor="green"
  lineWidth={2}
  editable
/>
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `Location` | Yes | - | Top-left corner coordinates |
| `size` | `Size \| Location` | Yes | - | Size in degrees (`{ width, height }`) or bottom-right corner (`{ lon, lat }`) |
| `ref` | `Ref<RectangleRef>` | No | - | Ref for imperative control (see [RectangleRef](#rectangleref)) |
| `title` | `string` | No | - | Text shown on hover tooltip |
| `detail` | `string` | No | - | Text shown in popup when clicked |
| `popup` | `PopupOptions` | No | - | Popup configuration (overrides `detail`) |
| `visibleRange` | `Range` | No | All zoom levels | Zoom range at which the rectangle is visible |
| `lineWidth` | `number` | No | `3` | Border width in pixels |
| `lineColor` | `string` | No | Preset color | Border color (any CSS color value) |
| `fillColor` | `string` | No | Preset color | Fill color (any CSS color value) |
| `lineStyle` | `"Solid" \| "Dashed" \| "Dot"` | No | `"Solid"` | Border line style |
| `clickable` | `boolean` | No | `false` | Show pointer cursor on hover |
| `draggable` | `boolean` | No | `false` | Allow the user to drag this rectangle |
| `editable` | `boolean` | No | `false` | Allow corner editing |
| `zIndex` | `number` | No | `0` | Stacking order |
| `onClick` | `(rectangle: SphereRectangle) => void` | No | - | Called when the rectangle is clicked |
| `onDrag` | `(rectangle: SphereRectangle) => void` | No | - | Called while the rectangle is being dragged |
| `onDrop` | `(rectangle: SphereRectangle) => void` | No | - | Called when the rectangle is dropped after dragging |

---

### Layer

Add built-in or custom tile layers to the map.

```tsx
{/* Built-in data layer */}
<Layer preset="TRAFFIC" />

{/* Custom WMS layer */}
<Layer
  name="my-wms-layer"
  type="WMS"
  url="https://example.com/wms"
  zoomRange={{ min: 1, max: 18 }}
  opacity={0.7}
/>

{/* Change the base layer */}
<Layer preset="HYBRID" isBase />
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `preset` | `BuiltInLayer` | No | - | Use a built-in layer (see [Built-in Layers](#built-in-layers)) |
| `name` | `string` | Conditional | - | Layer name (required when `preset` is not provided) |
| `isBase` | `boolean` | No | `false` | Set as the base layer instead of adding as overlay |
| `type` | `LayerType` | No | `"Vector"` | Layer type (see [Layer Types](#layer-types) below) |
| `url` | `string` | No | Sphere tile server | Tile server URL |
| `zoomRange` | `Range` | No | All zoom levels | Visible zoom range (`{ min, max }`) |
| `source` | `Range` | No | All zoom levels | Available tile zoom range |
| `opacity` | `number` | No | `1` | Layer opacity (0 = transparent, 1 = opaque) |
| `zIndex` | `number` | No | `0` | Stacking order (higher values appear on top) |
| `bound` | `Bound` | No | World | Only show tiles within this bounding box |
| `attribution` | `string` | No | - | Attribution text for the layer |
| `extraQuery` | `string` | No | - | Extra query string appended to tile requests |
| `id` | `string` | No | Layer name | Unique layer identifier |
| `format` | `string` | No | `"image/png"` (WMS) / `"png"` (others) | Image format or MIME type |
| `srs` | `string` | No | `"EPSG:3857"` | Spatial reference system / tile matrix set |
| `tileMatrixPrefix` | `string` | No | - | WMTS tile matrix prefix before zoom level |
| `styles` | `string` | No | Default | Layer styles |
| `version` | `string` | No | `"1.1.1"` (WMS) | WMS/WMTS version |
| `refresh` | `number` | No | - | Auto-refresh interval in milliseconds |
| `zoomOffset` | `number` | No | - | Zoom level offset for tile requests |
| `beforeId` | `string` | No | Symbol layer | Insert layer before this layer ID |

#### Layer Types

| Type | Description |
|------|-------------|
| `"Vector"` | Mapbox Vector Tiles (default) |
| `"XYZ"` | XYZ raster tiles |
| `"WMS"` | Web Map Service |
| `"WMTS"` | Web Map Tile Service (key-value-pairs encoding) |
| `"WMTS_REST"` | Web Map Tile Service (RESTful encoding) |
| `"TMS"` | Tile Map Service |
| `"Tiles3D"` | OGC 3D Tiles |
| `"I3S"` | Indexed 3D Scene Layer |

---

## Hooks

### useMap

Access the raw map instance and the Sphere API namespace directly.

```tsx
import { useMap } from 'gistda-sphere-react';

function MapInfo() {
  const { map, sphere, isReady } = useMap();

  if (!isReady) return <div>Loading...</div>;

  return <div>Zoom: {map.zoom()}</div>;
}
```

| Return Property | Type | Description |
|-----------------|------|-------------|
| `map` | `SphereMapInstance \| null` | The underlying Sphere map instance |
| `sphere` | `SphereNamespace \| null` | The global `sphere` API namespace |
| `isReady` | `boolean` | `true` when the map is initialized and ready to use |

---

### useSphere

Access the Sphere API namespace without requiring a map.

```tsx
import { useSphere } from 'gistda-sphere-react';

function SphereInfo() {
  const { sphere, isLoaded, error, apiKey } = useSphere();

  if (!isLoaded) return <div>Loading API...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>API loaded with key: {apiKey}</div>;
}
```

| Return Property | Type | Description |
|-----------------|------|-------------|
| `sphere` | `SphereNamespace \| null` | The global `sphere` API namespace |
| `isLoaded` | `boolean` | `true` when the API script has loaded |
| `error` | `Error \| null` | Error if the API failed to load |
| `apiKey` | `string` | The API key passed to `SphereProvider` |

---

### useMapControls

Control the map programmatically from any component inside `SphereProvider`.

```tsx
import { useMapControls } from 'gistda-sphere-react';

function Sidebar() {
  const { goTo, setZoom, setFilter, setBaseLayer, isReady } = useMapControls();

  return (
    <div>
      <button onClick={() => goTo({ center: { lon: 98.98, lat: 18.78 }, zoom: 12 })}>
        Go to Chiang Mai
      </button>
      <button onClick={() => setZoom(15)}>Zoom In</button>
      <button onClick={() => setFilter('Dark')}>Dark Mode</button>
      <button onClick={() => setBaseLayer('HYBRID')}>Satellite</button>
    </div>
  );
}
```

| Function | Parameters | Description |
|----------|------------|-------------|
| `isReady` | - | `boolean` indicating whether the map is ready |
| `goTo` | `(options: FlyToOptions, animate?: boolean)` | Navigate to a location with optional zoom, rotation, pitch, and padding. Accepts [MapLibre FlyToOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FlyToOptions/) |
| `setCenter` | `(location: Location, animate?: boolean)` | Set the map center |
| `setZoom` | `(zoom: number, animate?: boolean)` | Set the zoom level |
| `setBound` | `(bound: Bound, options?: FitBoundsOptions)` | Fit the map to a bounding box |
| `setRotate` | `(angle: number, animate?: boolean)` | Set rotation angle in degrees (clockwise from north) |
| `setPitch` | `(angle: number)` | Set pitch angle in degrees |
| `setFilter` | `(filter: FilterType \| false)` | Apply a color filter, or pass `false` to remove |
| `setLanguage` | `(language: string)` | Change the map language (ISO 639-1 code) |
| `setBaseLayer` | `(layer: BuiltInLayer)` | Change the base map layer |
| `addLayer` | `(layer: BuiltInLayer)` | Add a data layer on top of the base layer |
| `removeLayer` | `(layer: BuiltInLayer)` | Remove a data layer |
| `loadPredefinedOverlay` | `(overlay: PredefinedOverlay)` | Load a predefined overlay (`"cameras"`, `"events"`, or `"aqi"`) |
| `unloadPredefinedOverlay` | `(overlay: PredefinedOverlay)` | Remove a predefined overlay |
| `resize` | `()` | Resize the map to fit its container |
| `repaint` | `()` | Force the map to repaint |

---

### Event Hooks

Listen to map events from any component inside `SphereMap`.

```tsx
import {
  useMapReady,
  useMapClick,
  useMapZoom,
  useMapLocation,
  useOverlayClick,
  useMapEvent,
} from 'gistda-sphere-react';

function MapEvents() {
  useMapReady(() => {
    console.log('Map is ready');
  });

  useMapClick((location) => {
    console.log('Clicked at:', location.lon, location.lat);
  });

  useMapZoom(() => {
    console.log('Zoom changed');
  });

  useMapLocation(() => {
    console.log('Map center changed');
  });

  useOverlayClick(({ overlay, location }) => {
    console.log('Overlay clicked at:', location);
  });

  // Generic event hook for any Sphere event
  useMapEvent('rotate', (angle) => {
    console.log('Rotated to:', angle);
  });

  return null;
}
```

| Hook | Handler Signature | Description |
|------|-------------------|-------------|
| `useMapReady` | `() => void` | Fires when the map is initialized |
| `useMapClick` | `(location: Location) => void` | Fires when the map is clicked |
| `useMapZoom` | `() => void` | Fires when the zoom level changes |
| `useMapLocation` | `() => void` | Fires when the map center changes |
| `useOverlayClick` | `(data: { overlay: SphereOverlay, location: Location }) => void` | Fires when any overlay on the map is clicked |
| `useMapEvent` | `(data: unknown) => void` | Generic hook to listen to any Sphere event by name |

**Available event names for `useMapEvent`:**

| Event Name | Data Received | Description |
|------------|---------------|-------------|
| `"ready"` | - | Map is ready to use |
| `"resize"` | - | Map has been resized |
| `"repaint"` | - | Map has been repainted |
| `"zoom"` | - | Zoom level changed |
| `"zoomRange"` | - | Zoom range changed |
| `"location"` | - | Map center changed |
| `"fullscreen"` | `boolean` | Map entered/exited fullscreen |
| `"rotate"` | - | Map rotation changed |
| `"pitch"` | - | Map pitch changed |
| `"click"` | `Location` | User clicked the map |
| `"doubleClick"` | `Location` | User double-clicked the map |
| `"mousemove"` | `Location` | Mouse moved over the map |
| `"wheel"` | `Point` | Mouse wheel scrolled |
| `"drag"` | - | User started dragging |
| `"drop"` | - | User stopped dragging |
| `"idle"` | - | Map is idle (no input, animation, or tile loading) |
| `"layerChange"` | `Layer` (added), `Layer` (removed) | A layer was added or removed |
| `"tileLoading"` | `string` (layer name) | Tiles are loading |
| `"tileLoaded"` | `string` (layer name) | Tiles finished loading |
| `"overlayChange"` | `Overlay` | An overlay was added, removed, or cleared |
| `"overlayUpdate"` | `Overlay` | An overlay was modified |
| `"overlayClick"` | `{ overlay, location }` | User clicked an overlay |
| `"overlayLoad"` | `object` | Predefined overlays finished loading |
| `"overlayDrag"` | `Overlay` | User started dragging an overlay |
| `"overlayDrop"` | `Overlay` | User dropped an overlay |
| `"overlayHover"` | `Overlay` | Mouse entered an overlay |
| `"overlayLeave"` | `Overlay` | Mouse left an overlay |
| `"popupClose"` | `Popup` | A popup was closed |
| `"routeError"` | `number` (error code) | A routing error occurred |
| `"routeComplete"` | `object[]` (route list) | Route calculation completed |
| `"error"` | `object` (error message) | An error occurred |
| `"toolbarChange"` | `string` (mode) | Toolbar drawing mode changed |
| `"drawCreate"` | `GeoJSON[]` | Features were created via drawing |
| `"drawDelete"` | `GeoJSON[]` | Features were deleted via drawing |
| `"tooltipChange"` | `string` (message) | Map tooltip changed |
| `"beforeContextmenu"` | `MenuEvent` | Context menu is about to appear (return `false` to prevent) |
| `"contextmenu"` | - | Context menu appeared |

---

### useSearch

Search for points of interest (POIs) and perform reverse geocoding.

```tsx
import { useSearch } from 'gistda-sphere-react';

function SearchComponent() {
  const { search, suggest, address, nearPoi, isReady } = useSearch();

  const searchCoffee = async () => {
    const results = await search('coffee', { limit: 10 });
    console.log(results.data);
  };

  const getSuggestions = async () => {
    const results = await suggest('กรุงเทพ', { limit: 5 });
    console.log(results.data);
  };

  const reverseGeocode = async (location) => {
    const addr = await address(location);
    console.log(addr.address, addr.province);
  };

  const findNearby = async (location) => {
    const pois = await nearPoi(location, { limit: 5, span: 0.01 });
    console.log(pois);
  };

  return <button onClick={searchCoffee}>Search Coffee Shops</button>;
}
```

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `isReady` | - | `boolean` | Whether the search service is initialized |
| `suggest` | `(keyword: string, options?: SuggestOptions)` | `Promise<SearchResult>` | Get auto-complete search suggestions |
| `search` | `(keyword: string, options?: SearchOptions)` | `Promise<SearchResult>` | Search for POIs by keyword |
| `address` | `(location: Location, options?: AddressOptions)` | `Promise<AddressResult>` | Reverse geocode a location to an address |
| `nearPoi` | `(location: Location, options?: NearPoiOptions)` | `Promise<PoiResult[]>` | Find POIs near a location |
| `clear` | `()` | `void` | Clear search results from the map |
| `enablePopup` | `(state: boolean)` | `void` | Enable or disable popups for search results |
| `setLanguage` | `(lang: string)` | `void` | Set the search language (ISO 639-1 code) |

**SuggestOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `area` | `string` | Any area | Geocode to restrict suggestions to a specific area |
| `offset` | `number` | `0` | Offset of the first result returned |
| `limit` | `number` | `10` | Maximum number of results to return |
| `dataset` | `string` | Default data | Search dataset to use |

**SearchOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `area` | `string` | Any area | Geocode to restrict search to a specific area |
| `tag` | `string` | Any tag | Filter results by tag category |
| `span` | `string` | Anywhere | Search radius with unit (e.g. `"5km"`, `"1000m"`, `"0.1deg"`) |
| `offset` | `number` | `0` | Offset of the first result returned |
| `limit` | `number` | `20` | Maximum number of results to return |
| `dataset` | `string` | Default data | Search dataset to use |

**AddressOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `limit` | `number` | `5` | Maximum number of results when searching by street address |
| `dataset` | `string` | Default data | Dataset for address lookup |

**NearPoiOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `span` | `number` | Optimal span | Search radius in degrees |
| `zoom` | `number` | All zoom levels | Maximum POI zoom level |
| `limit` | `number` | `10` | Maximum number of results to return |

**Return types:**

```typescript
// SearchResult (returned by suggest and search)
{
  data: object[];    // Array of POI result objects
  total?: number;    // Total number of matching results
}

// AddressResult (returned by address)
{
  address?: string;      // Full address string
  subdistrict?: string;  // Sub-district name
  district?: string;     // District name
  province?: string;     // Province name
  postcode?: string;     // Postal code
  geocode?: string;      // Area geocode
}

// PoiResult (returned by nearPoi)
{
  id: string;            // POI identifier
  name: string;          // POI name
  location: Location;    // POI coordinates
  category?: string;     // POI category
  distance?: number;     // Distance from search location in meters
}
```

---

### useRoute

Calculate and display routes between locations.

```tsx
import { useRoute } from 'gistda-sphere-react';

function RouteComponent() {
  const { addDestination, search, getDistance, getInterval, getGuide, clear, isReady } = useRoute();

  const calculateRoute = () => {
    addDestination({ lon: 100.5018, lat: 13.7563 }); // Bangkok
    addDestination({ lon: 98.9853, lat: 18.7883 });  // Chiang Mai
    search(); // Calculate and display the route
  };

  const showInfo = () => {
    console.log('Distance:', getDistance(true)); // e.g. "450 km"
    console.log('Time:', getInterval(true));     // e.g. "5 hours 30 mins"
  };

  return (
    <div>
      <button onClick={calculateRoute}>Calculate Route</button>
      <button onClick={showInfo}>Show Info</button>
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `isReady` | - | `boolean` | Whether the routing service is initialized |
| `addDestination` | `(destination: SphereMarker \| Location, mode?: RouteMode)` | `void` | Add a destination to the route |
| `insertDestination` | `(index: number, destination: SphereMarker \| Location, mode?: RouteMode)` | `void` | Insert a destination at a specific index |
| `removeDestination` | `(destination: SphereMarker)` | `void` | Remove a destination by its marker reference |
| `removeDestinationAt` | `(index: number)` | `void` | Remove a destination by index |
| `clearDestinations` | `()` | `void` | Remove all destinations |
| `clearPath` | `()` | `void` | Remove the displayed route path only |
| `clear` | `()` | `void` | Remove the entire route (destinations and path) |
| `reverse` | `()` | `void` | Reverse the direction of the route |
| `search` | `()` | `void` | Calculate and display the route |
| `getDistance` | `(format?: boolean)` | `number \| string` | Get total distance. Pass `true` for formatted string (e.g. `"450 km"`), `false` for meters |
| `getInterval` | `(format?: boolean)` | `number \| string` | Get estimated travel time. Pass `true` for formatted string (e.g. `"5 hours 30 mins"`), `false` for seconds |
| `getGuide` | `(format?: boolean)` | `RouteGuideStep[] \| HTMLElement` | Get turn-by-turn directions. Pass `true` for an HTML element, `false` for data array |
| `exportRouteLine` | `(options?: GeometryOptions)` | `SpherePolyline \| null` | Export the calculated route as a Polyline overlay |
| `listDestinations` | `()` | `SphereMarker[]` | List all destination markers |
| `size` | `()` | `number` | Get the number of destinations |
| `setMode` | `(mode: RouteMode)` | `void` | Set the routing mode for all destinations |
| `setModeAt` | `(index: number, mode: RouteMode)` | `void` | Set the routing mode for a specific destination segment |
| `enableRouteType` | `(routeType: RouteType, state: boolean)` | `void` | Enable or disable a route type |
| `setLabel` | `(label: RouteLabelType)` | `void` | Set label display mode on the route |
| `setAuto` | `(state: boolean)` | `void` | Enable or disable auto-recalculation when destinations change |
| `setLanguage` | `(lang: string)` | `void` | Set the routing language |

**RouteMode values:**

| Mode | Description |
|------|-------------|
| `"Traffic"` | Fastest route using real-time and predicted traffic data; avoids road closures and floods |
| `"Cost"` | Fastest route without traffic consideration |
| `"Distance"` | Shortest route by distance |
| `"Fly"` | Direct straight line to destination |

**RouteType values:**

| Type | Description |
|------|-------------|
| `"Road"` | Regular roads |
| `"Ferry"` | Ferry routes |
| `"Tollway"` | Toll roads / expressways |
| `"All"` | All route types |

**RouteLabelType values:**

| Label | Description |
|-------|-------------|
| `"Distance"` | Show distance labels on the route |
| `"Time"` | Show time labels on the route |
| `"Hide"` | Hide all labels |

**RouteGuideStep (when `format` is `false`):**

```typescript
{
  instruction: string;         // Turn-by-turn instruction text
  distance: number | string;   // Distance for this step
  duration: number | string;   // Duration for this step
  location: Location;          // Location of this step
}
```

---

### useTags

Display POI markers by category on the map. Tags are predefined groups of POIs from the Sphere database.

```tsx
import { useTags } from 'gistda-sphere-react';

function TagsComponent() {
  const { add, remove, clear, list, isReady } = useTags();

  const showRestaurants = () => {
    add('อาหารไทย');
    add('อาหารญี่ปุ่น');
  };

  const showServices = () => {
    clear();
    add('ธนาคาร');
    add('ATM');
    add('โรงพยาบาล');
  };

  return (
    <div>
      <button onClick={showRestaurants}>Show Restaurants</button>
      <button onClick={showServices}>Show Services</button>
      <button onClick={clear}>Clear All</button>
      <p>Active: {list().join(', ')}</p>
    </div>
  );
}
```

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `isReady` | - | `boolean` | Whether the tag service is initialized |
| `set` | `(tag: string \| TagDataFunction, options?: TagOptions)` | `void` | Clear all existing tags and set a new one |
| `add` | `(tag: string \| TagDataFunction, options?: TagOptions)` | `void` | Add a tag to the map |
| `remove` | `(tag: string)` | `void` | Remove a tag from the map |
| `clear` | `()` | `void` | Remove all tags from the map |
| `list` | `()` | `string[]` | Get the names of all active tags |
| `size` | `()` | `number` | Get the number of active tags |
| `enablePopup` | `(state: boolean)` | `void` | Enable or disable popups for tag POIs |
| `setLanguage` | `(lang: string)` | `void` | Set the tag display language |

> **Tip**: Use `"%"` as the tag name to load all available POIs.

**TagDataFunction** (for custom data sources):

```typescript
type TagDataFunction = (tile: Tile) => object[];
// tile: { x: number, y: number, z: number }
```

**TagOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `string` | Sphere tag server | Custom tag server URL |
| `type` | `"WFS" \| "OGC"` | Default server | Tag data source type |
| `icon` | `Icon \| string` | Default icons | Custom icon, or `"big"`/`"small"` for default icon sizes |
| `visibleRange` | `Range` | All zoom levels | Zoom range at which tags are visible |
| `label` | `Range` | None | Zoom range at which tag labels are visible |
| `area` | `string` | Any area | Geocode to restrict tags to a specific area |
| `dataset` | `string` | Default data | Tag dataset to use |

**WFS-specific TagOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | Required | WFS data name |
| `extraQuery` | `string` | - | Extra query string |
| `version` | `string` | `"2.0.0"` | WFS version |

**Available tag categories** (use `TAG_CATEGORIES` constant or Thai-language IDs directly):

| Category | Tag ID | English Label |
|----------|--------|---------------|
| Food & Dining | `อาหารไทย` | Thai Food |
| Food & Dining | `อาหารญี่ปุ่น` | Japanese |
| Food & Dining | `อาหารจีน` | Chinese |
| Food & Dining | `อาหารเกาหลี` | Korean |
| Food & Dining | `อาหารเวียดนาม` | Vietnamese |
| Food & Dining | `อาหารอินเดีย` | Indian |
| Food & Dining | `อาหารอิตาลี` | Italian |
| Food & Dining | `อาหารฝรั่งเศส` | French |
| Food & Dining | `อาหารเยอรมัน` | German |
| Food & Dining | `อาหารยุโรป` | European |
| Services | `ธนาคาร` | Bank |
| Services | `ATM` | ATM |
| Services | `โรงพยาบาล` | Hospital |
| Services | `ปั๊มน้ำมัน` | Gas Station |
| Tourism | `โรงแรม` | Hotel |
| Tourism | `วัด` | Temple |
| Tourism | `พิพิธภัณฑ์` | Museum |
| Tourism | `ห้างสรรพสินค้า` | Shopping Mall |

**Using `TAG_CATEGORIES` to build a UI:**

```tsx
import { TAG_CATEGORIES } from 'gistda-sphere-react';

function TagSelector() {
  const { add, remove } = useTags();

  return (
    <div>
      {TAG_CATEGORIES.map((category) => (
        <div key={category.name}>
          <h3>{category.name}</h3>
          {category.tags.map((tag) => (
            <button key={tag.id} onClick={() => add(tag.id)}>
              {tag.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### Overlay Collection Hooks

Manage collections of overlays programmatically using these hooks.

#### useMarkers

```tsx
import { useMarkers } from 'gistda-sphere-react';

function MarkerManager() {
  const { items, add, update, remove, clear, get } = useMarkers();

  const addMarker = () => {
    const id = add({
      position: { lon: 100.5, lat: 13.75 },
      title: 'New Marker',
      draggable: true,
    });
    console.log('Added marker with ID:', id);
  };

  return (
    <div>
      <button onClick={addMarker}>Add</button>
      <button onClick={clear}>Clear All</button>
      <p>Count: {items.length}</p>
    </div>
  );
}
```

#### usePolygons, usePolylines, useCircles

These hooks follow the same pattern as `useMarkers` but for their respective overlay types.

#### useOverlays

Combines all overlay collection hooks into a single hook.

```tsx
import { useOverlays } from 'gistda-sphere-react';

const { markers, polygons, polylines, circles, clearAll } = useOverlays();
```

**All overlay collection hooks return:**

| Property | Type | Description |
|----------|------|-------------|
| `items` | `T[]` | Array of current overlay data objects |
| `add` | `(data: OverlayInput<T>) => string` | Add an overlay and return its generated ID |
| `update` | `(id: string, data: Partial<T>) => void` | Update an overlay's properties by ID |
| `remove` | `(id: string) => void` | Remove an overlay by ID |
| `clear` | `() => void` | Remove all overlays of this type |
| `get` | `(id: string) => T \| undefined` | Get an overlay's data by ID |

---

## Built-in Layers

Use these with the `Layer` component's `preset` prop or with `useMapControls`'s `setBaseLayer`/`addLayer`/`removeLayer` functions.

| Layer | Type | Description |
|-------|------|-------------|
| `"SIMPLE"` | Base | Low-complexity base layer |
| `"STREETS"` | Base | Standard street map (default base layer) |
| `"STREETS_NIGHT"` | Base | Street map with dark theme |
| `"HYBRID"` | Base | Satellite imagery with street labels |
| `"IMAGES"` | Base | Satellite/aerial imagery without labels |
| `"TRAFFIC"` | Data | Real-time traffic overlay (auto-refreshes every 3 minutes) |
| `"PM25"` | Data | Air quality (PM2.5) heatmap |
| `"HOTSPOT"` | Data | Fire hotspot locations |
| `"FLOOD"` | Data | Flood-affected areas |
| `"DROUGHT"` | Data | Drought-affected areas |

**Base layers** replace the current base map. Only one base layer can be active at a time.

**Data layers** are added on top of the base layer. Multiple data layers can be active simultaneously.

```tsx
// Using the Layer component
<Layer preset="TRAFFIC" />           {/* Add data layer */}
<Layer preset="HYBRID" isBase />     {/* Change base layer */}

// Using useMapControls hook
const { setBaseLayer, addLayer, removeLayer } = useMapControls();

setBaseLayer('HYBRID');     // Change base layer
addLayer('TRAFFIC');        // Add data layer
addLayer('PM25');           // Add another data layer
removeLayer('TRAFFIC');     // Remove data layer
```

---

## Predefined Overlays

The Sphere API provides predefined overlays that display live data on the map.

| Overlay | Description |
|---------|-------------|
| `"cameras"` | Live CCTV traffic camera feeds with optional motion video |
| `"events"` | Active traffic and road events with popup details |
| `"aqi"` | Thai Air Quality Index data points with popup details |

```tsx
const { loadPredefinedOverlay, unloadPredefinedOverlay } = useMapControls();

loadPredefinedOverlay('cameras');      // Show CCTV cameras
loadPredefinedOverlay('events');       // Show traffic events
loadPredefinedOverlay('aqi');          // Show air quality data
unloadPredefinedOverlay('cameras');    // Hide CCTV cameras
```

---

## Color Filters

Apply visual color filters to the map for accessibility or aesthetics.

| Filter | Description |
|--------|-------------|
| `"Dark"` | Dark mode filter for map and UI |
| `"Light"` | Lighter map colors |
| `"Protanopia"` | Accessibility filter for red color blindness |
| `"Deuteranopia"` | Accessibility filter for green color blindness |
| `"None"` | No filter (default) |

```tsx
const { setFilter } = useMapControls();

setFilter('Dark');          // Apply dark mode
setFilter('Protanopia');    // Apply red color blindness filter
setFilter('Light');         // Apply lighter colors
setFilter(false);           // Remove filter (same as 'None')
```

---

## Ref APIs

All overlay components support React refs for imperative control. Access the underlying Sphere API instance and call methods directly.

### SphereMapRef

```tsx
const mapRef = useRef<SphereMapRef>(null);

<SphereMap ref={mapRef} style={{ height: '500px' }}>
  {/* children */}
</SphereMap>

// Later:
mapRef.current?.setZoom(15);
mapRef.current?.goTo({ center: { lon: 100.5, lat: 13.75 }, zoom: 12 });
```

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getMap` | `()` | `SphereMapInstance \| null` | Get the underlying map instance |
| `setZoom` | `(zoom: number, animate?: boolean)` | `void` | Set zoom level |
| `setCenter` | `(location: Location, animate?: boolean)` | `void` | Set map center |
| `setBound` | `(bound: Bound, options?: object)` | `void` | Fit map to bounding box |
| `goTo` | `(target: FlyToOptions, animate?: boolean)` | `void` | Animate to a target location/zoom/rotation/pitch |
| `setRotate` | `(angle: number, animate?: boolean)` | `void` | Set rotation angle |
| `setPitch` | `(angle: number)` | `void` | Set pitch angle |
| `setFilter` | `(filter: FilterType)` | `void` | Apply a color filter |
| `resize` | `()` | `void` | Resize map to fit container |
| `repaint` | `()` | `void` | Force map repaint |

### MarkerRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getMarker` | `()` | `SphereMarker \| null` | Get the underlying marker instance |
| `togglePopup` | `(show?: boolean)` | `void` | Show or hide the marker popup (toggles if no argument) |
| `setPosition` | `(location: Location, animate?: boolean)` | `void` | Move the marker to a new location |
| `setRotation` | `(angle: number)` | `void` | Set rotation angle in degrees |

### PolygonRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getPolygon` | `()` | `SpherePolygon \| null` | Get the underlying polygon instance |
| `togglePopup` | `(show?: boolean, location?: Location)` | `void` | Show or hide popup at the specified location |
| `getPivot` | `()` | `Location \| null` | Get a point on the polygon surface |
| `getCentroid` | `()` | `Location \| null` | Get the geometric center |
| `getBound` | `()` | `Bound \| null` | Get the bounding box |
| `getArea` | `(language?: string)` | `number \| string \| null` | Get area in square meters, or formatted if language is provided (e.g. `"th"`) |
| `rotate` | `(angle: number)` | `void` | Rotate the polygon by an angle in degrees |
| `updateStyle` | `(options: Partial<GeometryOptions>)` | `void` | Update line/fill style (lineWidth, lineColor, fillColor, lineStyle) |
| `toGeoJSON` | `()` | `object \| null` | Convert to GeoJSON |

### PolylineRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getPolyline` | `()` | `SpherePolyline \| null` | Get the underlying polyline instance |
| `togglePopup` | `(show?: boolean, location?: Location)` | `void` | Show or hide popup |
| `getPivot` | `()` | `Location \| null` | Get a point on the line |
| `getCentroid` | `()` | `Location \| null` | Get the geometric center |
| `getBound` | `()` | `Bound \| null` | Get the bounding box |
| `getLength` | `(language?: string)` | `number \| string \| null` | Get length in meters, or formatted if language is provided (e.g. `"th"` returns `"309 กม."`) |
| `rotate` | `(angle: number)` | `void` | Rotate the polyline by an angle |
| `updateStyle` | `(options: Partial<GeometryOptions>)` | `void` | Update line style |

### CircleRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getCircle` | `()` | `SphereCircle \| null` | Get the underlying circle instance |
| `togglePopup` | `(show?: boolean, location?: Location)` | `void` | Show or hide popup |
| `getCenter` | `()` | `Location \| null` | Get the circle center |
| `getBound` | `()` | `Bound \| null` | Get the bounding box |
| `getArea` | `(language?: string)` | `number \| string \| null` | Get area in square meters, or formatted |
| `getRadius` | `(language?: string)` | `number \| string \| null` | Get radius in meters, or formatted |
| `updateStyle` | `(options: Partial<GeometryOptions>)` | `void` | Update circle style |

### PopupRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getPopup` | `()` | `SpherePopup \| null` | Get the underlying popup instance |
| `setPosition` | `(location: Location)` | `void` | Move the popup to a new location |
| `setTitle` | `(title: string)` | `void` | Change the popup title |
| `setDetail` | `(detail: string)` | `void` | Change the popup detail text |
| `getElement` | `()` | `HTMLElement \| null` | Get the popup's DOM element |

### DotRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDot` | `()` | `SphereDot \| null` | Get the underlying dot instance |
| `setPosition` | `(location: Location)` | `void` | Move the dot to a new location |
| `getPosition` | `()` | `Location \| null` | Get the current dot position |

### RectangleRef

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getRectangle` | `()` | `SphereRectangle \| null` | Get the underlying rectangle instance |
| `togglePopup` | `(show?: boolean, location?: Location)` | `void` | Show or hide popup |
| `getBound` | `()` | `Bound \| null` | Get the bounding box |
| `getArea` | `(language?: string)` | `number \| string \| null` | Get area in square meters, or formatted |
| `updateStyle` | `(options: Partial<GeometryOptions>)` | `void` | Update rectangle style |

---

## TypeScript

All types are exported from the package:

```tsx
import type {
  // Core geometric types
  Location,             // { lon: number, lat: number }
  Point,                // { x: number, y: number }
  Size,                 // { width: number, height: number }
  Range,                // { min: number, max: number }
  Bound,                // { minLon: number, minLat: number, maxLon: number, maxLat: number }
  Tile,                 // { x: number, y: number, z: number }
  Icon,                 // { url?, urlHD?, html?, offset?: Point, size?: Size }

  // Enum types
  BuiltInLayer,         // 'SIMPLE' | 'STREETS' | 'STREETS_NIGHT' | 'HYBRID' | 'TRAFFIC' | 'IMAGES' | 'PM25' | 'HOTSPOT' | 'FLOOD' | 'DROUGHT'
  LayerType,            // 'Vector' | 'XYZ' | 'WMS' | 'WMTS' | 'WMTS_REST' | 'TMS' | 'Tiles3D' | 'I3S'
  FilterType,           // 'Dark' | 'Light' | 'Protanopia' | 'Deuteranopia' | 'None'
  LineStyleType,        // 'Solid' | 'Dashed' | 'Dot'
  PredefinedOverlay,    // 'cameras' | 'events' | 'aqi'
  UiComponentMode,      // 'Full' | 'Mobile' | 'None'

  // Options types
  PopupOptions,         // Popup configuration
  GeometryOptions,      // Geometry styling options
  MarkerOptions,        // Marker configuration
  TagOptions,           // Tag configuration
  SearchOptions,        // Search query options
  SuggestOptions,       // Suggest query options
  AddressOptions,       // Address lookup options
  NearPoiOptions,       // Nearby POI search options

  // Route types
  RouteMode,            // 'Traffic' | 'Cost' | 'Distance' | 'Fly'
  RouteType,            // 'Road' | 'Ferry' | 'Tollway' | 'All'
  RouteLabelType,       // 'Distance' | 'Time' | 'Hide'
  RouteGuideStep,       // Route instruction step

  // Tag types
  TagType,              // 'WFS' | 'OGC'

  // Instance types
  SphereMapInstance,     // Map instance type
  SphereMarker,         // Marker instance type
  SpherePolygon,        // Polygon instance type
  SpherePolyline,       // Polyline instance type
  SphereCircle,         // Circle instance type
  SphereDot,            // Dot instance type
  SphereRectangle,      // Rectangle instance type
  SpherePopup,          // Popup instance type
  SphereOverlay,        // Base overlay instance type
  SphereNamespace,      // Global sphere namespace

  // Ref types
  SphereMapRef,         // Map component ref
  MarkerRef,            // Marker component ref
  PolygonRef,           // Polygon component ref
  PolylineRef,          // Polyline component ref
  CircleRef,            // Circle component ref
  PopupRef,             // Popup component ref
  DotRef,               // Dot component ref
  RectangleRef,         // Rectangle component ref
} from 'gistda-sphere-react';
```

### Icon Type

The `Icon` type is used for custom marker icons. You can provide either a URL-based or HTML-based icon:

```typescript
// URL-based icon
{
  url: string;           // Icon image URL (required for URL-based)
  urlHD?: string;        // High-DPI icon URL
  size?: Size;           // Icon size in pixels ({ width, height }). Default: image dimensions
  offset?: Point;        // Icon offset from the anchor point ({ x, y }). Default: center of icon
}

// HTML-based icon (overrides url)
{
  html: string;          // Custom HTML content for the icon
  offset?: Point;        // Offset from the anchor point
  size?: Size;           // Logical size
}
```

### PopupOptions Type

Used for configuring popups on markers and geometries:

```typescript
{
  title?: string;                            // Popup title (supports HTML)
  detail?: string;                           // Popup detail (supports HTML)
  loadDetail?: (element: HTMLElement) => void; // Dynamically load detail content
  html?: string;                             // Custom HTML content (overrides detail)
  loadHtml?: (element: HTMLElement) => void;  // Dynamically load custom HTML
  size?: Size;                               // Popup size ({ width, height })
  closable?: boolean;                        // Show close button (default: true)
}
```

---

## Examples

### Adding Elements Programmatically

Use React state to add markers, polygons, or any overlay dynamically:

```tsx
import { useState } from 'react';
import { SphereProvider, SphereMap, Marker, type Location } from 'gistda-sphere-react';

function App() {
  const [markers, setMarkers] = useState<Location[]>([]);

  const addMarker = () => {
    const newMarker = {
      lon: 100.5 + (Math.random() - 0.5) * 0.2,
      lat: 13.75 + (Math.random() - 0.5) * 0.2,
    };
    setMarkers([...markers, newMarker]);
  };

  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <div>
        <button onClick={addMarker}>Add Marker</button>
        <button onClick={() => setMarkers([])}>Clear All</button>
      </div>
      <SphereMap center={{ lon: 100.5, lat: 13.75 }} zoom={11} style={{ height: '500px' }}>
        {markers.map((position) => (
          <Marker key={`${position.lon}-${position.lat}`} position={position} />
        ))}
      </SphereMap>
    </SphereProvider>
  );
}
```

### Interactive Marker Placement

Click on the map to add markers:

```tsx
import { useState } from 'react';
import { SphereProvider, SphereMap, Marker, type Location } from 'gistda-sphere-react';

function App() {
  const [markers, setMarkers] = useState<Location[]>([]);

  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <button onClick={() => setMarkers([])}>Clear</button>
      <SphereMap
        center={{ lon: 100.5, lat: 13.75 }}
        zoom={10}
        style={{ height: '500px' }}
        onClick={(location) => setMarkers([...markers, location])}
      >
        {markers.map((pos) => (
          <Marker key={`${pos.lon}-${pos.lat}`} position={pos} />
        ))}
      </SphereMap>
    </SphereProvider>
  );
}
```

### Drawing Polygons

Click to add points, double-click to finish the polygon:

```tsx
import { useState } from 'react';
import { SphereProvider, SphereMap, Polygon, Marker, type Location } from 'gistda-sphere-react';

function App() {
  const [points, setPoints] = useState<Location[]>([]);
  const [polygons, setPolygons] = useState<Location[][]>([]);

  const handleDoubleClick = () => {
    if (points.length >= 3) {
      setPolygons([...polygons, points]);
      setPoints([]);
    }
  };

  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <SphereMap
        center={{ lon: 100.5, lat: 13.75 }}
        zoom={10}
        style={{ height: '500px' }}
        onClick={(location) => setPoints([...points, location])}
        onDoubleClick={handleDoubleClick}
      >
        {polygons.map((positions) => (
          <Polygon
            key={positions.map((p) => `${p.lon},${p.lat}`).join('|')}
            positions={positions}
            fillColor="rgba(255,0,0,0.3)"
            lineColor="red"
          />
        ))}
        {points.map((pos) => (
          <Marker key={`${pos.lon}-${pos.lat}`} position={pos} />
        ))}
      </SphereMap>
    </SphereProvider>
  );
}
```

### Sidebar with Map Controls

Control the map from a sidebar component:

```tsx
import { SphereProvider, SphereMap, Marker, useMapControls } from 'gistda-sphere-react';

const cities = [
  { name: 'Bangkok', lon: 100.5018, lat: 13.7563 },
  { name: 'Chiang Mai', lon: 98.9853, lat: 18.7883 },
  { name: 'Phuket', lon: 98.3923, lat: 7.8804 },
];

function Sidebar() {
  const { goTo, setBaseLayer, setFilter } = useMapControls();

  return (
    <div style={{ padding: '1rem', width: '200px' }}>
      <h3>Cities</h3>
      {cities.map((city) => (
        <button key={city.name} onClick={() => goTo({ center: city, zoom: 12 })}>
          {city.name}
        </button>
      ))}
      <h3>Layers</h3>
      <button onClick={() => setBaseLayer('STREETS')}>Streets</button>
      <button onClick={() => setBaseLayer('HYBRID')}>Satellite</button>
      <h3>Filters</h3>
      <button onClick={() => setFilter('Dark')}>Dark</button>
      <button onClick={() => setFilter(false)}>None</button>
    </div>
  );
}

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <SphereMap style={{ flex: 1 }}>
          {cities.map((city) => (
            <Marker key={city.name} position={city} title={city.name} />
          ))}
        </SphereMap>
      </div>
    </SphereProvider>
  );
}
```

### Custom WMS Layer

Add a custom Web Map Service layer:

```tsx
import { SphereProvider, SphereMap, Layer } from 'gistda-sphere-react';

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <SphereMap style={{ width: '100%', height: '500px' }}>
        <Layer
          name="bluemarble_terrain"
          type="WMS"
          url="https://ms.longdo.com/mapproxy/service"
          zoomRange={{ min: 1, max: 9 }}
          refresh={180000}
          opacity={0.7}
        />
      </SphereMap>
    </SphereProvider>
  );
}
```

### Routing between Locations

Calculate and display a route:

```tsx
import { SphereProvider, SphereMap, useRoute } from 'gistda-sphere-react';

function RoutePanel() {
  const { addDestination, search, getDistance, getInterval, setMode, clear, isReady } = useRoute();

  const calculateRoute = () => {
    clear();
    addDestination({ lon: 100.5018, lat: 13.7563 }); // Bangkok
    addDestination({ lon: 98.9853, lat: 18.7883 });  // Chiang Mai
    setMode('Traffic'); // Use real-time traffic data
    search();
  };

  return (
    <div>
      <button onClick={calculateRoute} disabled={!isReady}>Calculate Route</button>
      <button onClick={() => console.log('Distance:', getDistance(true))}>Show Distance</button>
      <button onClick={() => console.log('Time:', getInterval(true))}>Show Time</button>
      <button onClick={clear}>Clear Route</button>
    </div>
  );
}

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <RoutePanel />
      <SphereMap style={{ width: '100%', height: '500px' }} />
    </SphereProvider>
  );
}
```

### Searching for POIs

Search for points of interest and reverse geocode:

```tsx
import { SphereProvider, SphereMap, useSearch } from 'gistda-sphere-react';

function SearchPanel() {
  const { search, address, nearPoi, isReady } = useSearch();

  const searchCoffee = async () => {
    const results = await search('coffee', { limit: 10 });
    console.log('Found:', results.data);
  };

  const reverseGeocode = async () => {
    const addr = await address({ lon: 100.5018, lat: 13.7563 });
    console.log('Address:', addr.address, addr.province);
  };

  const findNearby = async () => {
    const pois = await nearPoi({ lon: 100.5018, lat: 13.7563 }, { limit: 5 });
    console.log('Nearby POIs:', pois);
  };

  return (
    <div>
      <button onClick={searchCoffee} disabled={!isReady}>Search Coffee</button>
      <button onClick={reverseGeocode} disabled={!isReady}>Reverse Geocode</button>
      <button onClick={findNearby} disabled={!isReady}>Find Nearby</button>
    </div>
  );
}

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <SearchPanel />
      <SphereMap style={{ width: '100%', height: '500px' }} />
    </SphereProvider>
  );
}
```

### Displaying Tags on the Map

Show POI markers by category:

```tsx
import { SphereProvider, SphereMap, useTags } from 'gistda-sphere-react';

function TagPanel() {
  const { add, clear, list, isReady } = useTags();

  return (
    <div>
      <button onClick={() => add('โรงพยาบาล')} disabled={!isReady}>Show Hospitals</button>
      <button onClick={() => add('ATM')} disabled={!isReady}>Show ATMs</button>
      <button onClick={() => add('วัด')} disabled={!isReady}>Show Temples</button>
      <button onClick={clear}>Clear All</button>
      <p>Active tags: {list().join(', ')}</p>
    </div>
  );
}

function App() {
  return (
    <SphereProvider apiKey="YOUR_API_KEY">
      <TagPanel />
      <SphereMap style={{ width: '100%', height: '500px' }} />
    </SphereProvider>
  );
}
```

---

## Troubleshooting

**Map not rendering**
The map container needs an explicit height. Without it, the `<div>` collapses to 0px:

```tsx
<SphereMap style={{ width: '100%', height: '500px' }}>
```

**API key not working**
Make sure your domain is registered for the API key at [sphere.gistda.or.th](https://sphere.gistda.or.th/). For local development, register `localhost`.

**"useSphereContext must be used within a SphereProvider"**
Wrap your component tree with `<SphereProvider>`:

```tsx
<SphereProvider apiKey="YOUR_API_KEY">
  <App />
</SphereProvider>
```

**Hooks returning `isReady: false`**
Hooks like `useSearch`, `useRoute`, and `useTags` depend on the map being fully initialized. Wait for `isReady` to become `true` before calling their methods. You can also use the `onReady` prop on `SphereMap` or the `useMapReady` hook.

**Overlays not appearing**
Make sure the overlay components (Marker, Polygon, etc.) are placed inside the `<SphereMap>` component, not outside it.

---

## License

MIT
