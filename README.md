# gistda-sphere-react

> **Disclaimer**: This is an **unofficial** community project and is not affiliated with, endorsed by, or supported by GISTDA (Geo-Informatics and Space Technology Development Agency). For official documentation and support, please visit [sphere.gistda.or.th](https://sphere.gistda.or.th/).

A React wrapper for the [GISTDA Sphere Map API](https://sphere.gistda.or.th/). Build interactive maps of Thailand with TypeScript support.

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
  - [Hooks](#hooks)
    - [useMapControls](#usemapcontrols)
    - [useMap](#usemap)
    - [Event Hooks](#event-hooks)
    - [useSearch](#usesearch)
    - [useRoute](#useroute)
    - [useTags](#usetags)
  - [Examples](#examples)
    - [Adding Elements Programmatically](#adding-elements-programmatically)
    - [Interactive Marker Placement](#interactive-marker-placement)
    - [Drawing Polygons](#drawing-polygons)
    - [Sidebar with Map Controls](#sidebar-with-map-controls)
  - [Built-in Layers](#built-in-layers)
  - [Color Filters](#color-filters)
  - [Troubleshooting](#troubleshooting)
  - [TypeScript](#typescript)
  - [License](#license)

## Installation

```bash
npm install gistda-sphere-react
```

**Peer dependencies:** React 18+ and ReactDOM 18+

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

> **Note**: Register `localhost` for development.

## Components

### SphereProvider

Wraps your app and loads the Sphere API.

```tsx
<SphereProvider apiKey="YOUR_API_KEY">
  {/* Your app */}
</SphereProvider>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your GISTDA Sphere API key |
| `onLoad` | `() => void` | - | Called when API finishes loading |
| `onError` | `(error: Error) => void` | - | Called if API fails to load |

### SphereMap

The map container. All overlays (Marker, Polygon, etc.) go inside.

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `{ lon: number, lat: number }` | Bangkok | Initial map center |
| `zoom` | `number` | `7` | Initial zoom level (1-20) |
| `style` | `CSSProperties` | - | CSS styles for container |
| `className` | `string` | - | CSS class for container |
| `language` | `'th' \| 'en'` | `'th'` | Map label language |
| `onClick` | `(location) => void` | - | Map click handler |
| `onDoubleClick` | `(location) => void` | - | Map double-click handler |
| `onZoom` | `(zoom: number) => void` | - | Zoom change handler |
| `onLocation` | `(location) => void` | - | Center change handler |
| `onReady` | `(map) => void` | - | Called when map is ready |

### Marker

```tsx
<Marker
  position={{ lon: 100.5018, lat: 13.7563 }}
  title="Bangkok"
  detail="Capital of Thailand"
  draggable
  onDrop={(marker, newPosition) => console.log('Moved to:', newPosition)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{ lon: number, lat: number }` | *required* | Marker position |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail text |
| `draggable` | `boolean` | `false` | Allow dragging |
| `icon` | `{ url, size?, offset? }` | - | Custom icon |
| `rotate` | `number` | - | Rotation angle in degrees |
| `onClick` | `(marker) => void` | - | Click handler |
| `onDrag` | `(marker) => void` | - | Drag handler |
| `onDrop` | `(marker, location) => void` | - | Drop handler (after drag) |

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

### Polygon

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `positions` | `{ lon, lat }[]` | *required* | Array of vertices |
| `fillColor` | `string` | - | Fill color (CSS color) |
| `lineColor` | `string` | - | Border color |
| `lineWidth` | `number` | `1` | Border width in pixels |
| `lineStyle` | `'Solid' \| 'Dashed' \| 'Dot'` | `'Solid'` | Border style |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail |
| `draggable` | `boolean` | `false` | Allow dragging |
| `editable` | `boolean` | `false` | Allow vertex editing |
| `onClick` | `(polygon) => void` | - | Click handler |

### Polyline

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `positions` | `{ lon, lat }[]` | *required* | Array of points |
| `lineColor` | `string` | - | Line color (CSS color) |
| `lineWidth` | `number` | `1` | Line width in pixels |
| `lineStyle` | `'Solid' \| 'Dashed' \| 'Dot'` | `'Solid'` | Line style |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail |
| `draggable` | `boolean` | `false` | Allow dragging |
| `editable` | `boolean` | `false` | Allow vertex editing |
| `onClick` | `(polyline) => void` | - | Click handler |

### Circle

```tsx
<Circle
  center={{ lon: 100.5, lat: 13.75 }}
  radius={0.05}
  fillColor="rgba(0, 100, 255, 0.3)"
  lineColor="blue"
  lineWidth={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `{ lon: number, lat: number }` | *required* | Circle center |
| `radius` | `number` | *required* | Radius in degrees |
| `fillColor` | `string` | - | Fill color (CSS color) |
| `lineColor` | `string` | - | Border color |
| `lineWidth` | `number` | `1` | Border width in pixels |
| `lineStyle` | `'Solid' \| 'Dashed' \| 'Dot'` | `'Solid'` | Border style |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail |
| `draggable` | `boolean` | `false` | Allow dragging |
| `onClick` | `(circle) => void` | - | Click handler |

### Popup

```tsx
<Popup
  position={{ lon: 100.5, lat: 13.75 }}
  title="Info"
  detail="This is a popup"
  onClose={() => console.log('Popup closed')}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{ lon: number, lat: number }` | *required* | Popup position |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail text |
| `onClose` | `() => void` | - | Called when popup closes |

### Dot

A simple point marker on the map.

```tsx
<Dot
  position={{ lon: 100.5, lat: 13.75 }}
  lineWidth={10}
  lineColor="red"
  draggable
  onDrop={(dot, location) => console.log('Dropped at:', location)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{ lon: number, lat: number }` | *required* | Dot position |
| `lineWidth` | `number` | `3` | Dot size in pixels |
| `lineColor` | `string` | - | Dot color (CSS color) |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail |
| `draggable` | `boolean` | `false` | Allow dragging |
| `onClick` | `(dot) => void` | - | Click handler |
| `onDrop` | `(dot, location) => void` | - | Drop handler |

### Rectangle

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{ lon: number, lat: number }` | *required* | Top-left corner position |
| `size` | `{ width, height }` | *required* | Size in degrees |
| `fillColor` | `string` | - | Fill color (CSS color) |
| `lineColor` | `string` | - | Border color |
| `lineWidth` | `number` | `1` | Border width in pixels |
| `lineStyle` | `'Solid' \| 'Dashed' \| 'Dot'` | `'Solid'` | Border style |
| `title` | `string` | - | Popup title |
| `detail` | `string` | - | Popup detail |
| `draggable` | `boolean` | `false` | Allow dragging |
| `editable` | `boolean` | `false` | Allow corner editing |
| `onClick` | `(rectangle) => void` | - | Click handler |

### Layer

Add custom or built-in layers to the map.

```tsx
{/* Built-in layer preset */}
<Layer preset="TRAFFIC" />

{/* Custom WMS layer */}
<Layer
  name="my-wms-layer"
  type="WMS"
  url="https://example.com/wms"
  zoomRange={{ min: 1, max: 18 }}
  opacity={0.7}
/>

{/* Set as base layer */}
<Layer preset="HYBRID" isBase />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `BuiltInLayer` | - | Use a built-in layer |
| `name` | `string` | - | Custom layer name |
| `isBase` | `boolean` | `false` | Set as base layer |
| `type` | `'WMS' \| 'TMS' \| 'XYZ' \| ...` | `'Vector'` | Layer type |
| `url` | `string` | - | Tile server URL |
| `zoomRange` | `{ min, max }` | - | Visible zoom range |
| `opacity` | `number` | `1` | Layer opacity (0-1) |
| `zIndex` | `number` | `0` | Stacking order |

## Hooks

### useMapControls

Control the map from anywhere inside `SphereProvider`.

```tsx
import { useMapControls } from 'gistda-sphere-react';

function Sidebar() {
  const { goTo, setZoom, setFilter, setBaseLayer } = useMapControls();

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
| `goTo` | `{ center?, zoom? }` | Navigate to location with optional zoom |
| `setCenter` | `{ lon, lat }` | Set map center |
| `setZoom` | `number` | Set zoom level |
| `setFilter` | `FilterType \| false` | Apply color filter (see Filter Types below) |
| `setBaseLayer` | `BuiltInLayer` | Change base map layer |
| `addLayer` | `BuiltInLayer` | Add a data layer |
| `removeLayer` | `BuiltInLayer` | Remove a data layer |
| `setLanguage` | `'th' \| 'en'` | Change map language |
| `setRotate` | `number` | Set rotation angle |
| `setPitch` | `number` | Set pitch angle |

### useMap

Access the map instance directly.

```tsx
import { useMap } from 'gistda-sphere-react';

function MapInfo() {
  const { map, isReady } = useMap();

  if (!isReady) return <div>Loading...</div>;

  return <div>Map ID: {map.id()}</div>;
}
```

| Return Value | Type | Description |
|--------------|------|-------------|
| `map` | `SphereMap \| null` | The map instance |
| `sphere` | `SphereNamespace \| null` | The Sphere API namespace |
| `isReady` | `boolean` | `true` when map is ready to use |

### Event Hooks

Listen to map events from any component inside `SphereMap`:

```tsx
import { useMapClick, useMapZoom, useMapReady, useMapLocation, useOverlayClick } from 'gistda-sphere-react';

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

  return null;
}
```

| Hook | Handler Receives | Description |
|------|-----------------|-------------|
| `useMapReady` | `() => void` | Map finished initializing |
| `useMapClick` | `(location: { lon, lat }) => void` | Map was clicked |
| `useMapZoom` | `() => void` | Zoom level changed |
| `useMapLocation` | `() => void` | Map center changed |
| `useOverlayClick` | `({ overlay, location }) => void` | An overlay was clicked |
| `useMapEvent` | `(data) => void` | Generic — listen to any Sphere event by name |

### useSearch

Search for POIs and perform reverse geocoding.

```tsx
import { useSearch } from 'gistda-sphere-react';

function SearchComponent() {
  const { search, suggest, address, nearPoi, isReady } = useSearch();

  const searchCoffee = async () => {
    const results = await search('coffee', { limit: 10 });
    console.log(results.data);
  };

  const reverseGeocode = async (location) => {
    const addr = await address(location);
    console.log(addr.address, addr.province);
  };

  const findNearby = async (location) => {
    const pois = await nearPoi(location, { limit: 5 });
    console.log(pois);
  };

  return <button onClick={searchCoffee}>Search Coffee Shops</button>;
}
```

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `suggest` | `(keyword, options?)` | `Promise<SearchResult>` | Get search suggestions |
| `search` | `(keyword, options?)` | `Promise<SearchResult>` | Search for POIs |
| `address` | `(location, options?)` | `Promise<AddressResult>` | Reverse geocode location |
| `nearPoi` | `(location, options?)` | `Promise<PoiResult[]>` | Find nearby POIs |
| `clear` | `()` | `void` | Clear search results |
| `enablePopup` | `(state)` | `void` | Enable/disable result popups |
| `setLanguage` | `(lang)` | `void` | Set search language |

### useRoute

Calculate and display routes between locations.

```tsx
import { useRoute } from 'gistda-sphere-react';

function RouteComponent() {
  const { addDestination, search, getDistance, getInterval, clear, isReady } = useRoute();

  const calculateRoute = () => {
    addDestination({ lon: 100.5018, lat: 13.7563 }); // Bangkok
    addDestination({ lon: 98.9853, lat: 18.7883 });  // Chiang Mai
    search(); // Calculate route
  };

  const showInfo = () => {
    console.log('Distance:', getDistance(true)); // "450 km"
    console.log('Time:', getInterval(true));     // "5 hours 30 mins"
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
| `addDestination` | `(location, mode?)` | `void` | Add a destination |
| `insertDestination` | `(index, location, mode?)` | `void` | Insert destination at index |
| `removeDestinationAt` | `(index)` | `void` | Remove destination by index |
| `clearDestinations` | `()` | `void` | Clear all destinations |
| `clear` | `()` | `void` | Clear everything |
| `reverse` | `()` | `void` | Reverse route direction |
| `search` | `()` | `void` | Calculate and display route |
| `getDistance` | `(format?)` | `number \| string` | Get total distance |
| `getInterval` | `(format?)` | `number \| string` | Get estimated time |
| `getGuide` | `(format?)` | `RouteGuideStep[]` | Get turn-by-turn directions |
| `setMode` | `(mode)` | `void` | Set route mode (Traffic/Cost/Distance/Fly) |
| `setLabel` | `(label)` | `void` | Set label display (Distance/Time/Hide) |

### useTags

Display POI markers by category on the map.

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
| `set` | `(tag, options?)` | `void` | Set tag (clears existing) |
| `add` | `(tag, options?)` | `void` | Add a tag |
| `remove` | `(tag)` | `void` | Remove a tag |
| `clear` | `()` | `void` | Clear all tags |
| `list` | `()` | `string[]` | Get active tag names |
| `size` | `()` | `number` | Get tag count |
| `enablePopup` | `(state)` | `void` | Enable/disable tag popups |

**Available tag categories** (use the `TAG_CATEGORIES` constant or the Thai-language IDs directly):

- Food & Dining: `อาหารไทย` (Thai), `อาหารญี่ปุ่น` (Japanese), `อาหารจีน` (Chinese), `อาหารเกาหลี` (Korean), `อาหารเวียดนาม` (Vietnamese), `อาหารอินเดีย` (Indian), `อาหารอิตาลี` (Italian), `อาหารฝรั่งเศส` (French), `อาหารเยอรมัน` (German), `อาหารยุโรป` (European)
- Services: `ธนาคาร` (Bank), `ATM`, `โรงพยาบาล` (Hospital), `ปั๊มน้ำมัน` (Gas Station)
- Tourism: `โรงแรม` (Hotel), `วัด` (Temple), `พิพิธภัณฑ์` (Museum), `ห้างสรรพสินค้า` (Shopping Mall)

You can also iterate over `TAG_CATEGORIES` to build a UI:

```tsx
import { TAG_CATEGORIES } from 'gistda-sphere-react';

TAG_CATEGORIES.forEach((category) => {
  console.log(category.name); // "Food & Dining", "Services", "Tourism"
  category.tags.forEach((tag) => {
    console.log(tag.id, tag.label); // "อาหารไทย", "Thai Food"
  });
});
```

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

Click to add points, double-click to finish:

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
          <Polygon key={positions.map((p) => `${p.lon},${p.lat}`).join('|')} positions={positions} fillColor="rgba(255,0,0,0.3)" lineColor="red" />
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

## Built-in Layers

| Layer | Type | Description |
|-------|------|-------------|
| `SIMPLE` | Base | Simple map |
| `STREETS` | Base | Street map (default) |
| `STREETS_NIGHT` | Base | Street map (dark) |
| `HYBRID` | Base | Satellite with labels |
| `TRAFFIC` | Data | Real-time traffic |
| `PM25` | Data | Air quality (PM2.5) |
| `FLOOD` | Data | Flood areas |
| `HOTSPOT` | Data | Fire hotspots |
| `DROUGHT` | Data | Drought areas |

```tsx
const { setBaseLayer, addLayer, removeLayer } = useMapControls();

setBaseLayer('HYBRID');     // Change base layer
addLayer('TRAFFIC');        // Add data layer
removeLayer('TRAFFIC');     // Remove data layer
```

## Color Filters

| Filter | Description |
|--------|-------------|
| `Dark` | Dark mode filter |
| `Light` | Light mode filter |
| `Protanopia` | Red color blindness accessibility filter |
| `Deuteranopia` | Green color blindness accessibility filter |
| `None` | No filter (default) |

```tsx
const { setFilter } = useMapControls();

setFilter('Dark');          // Apply dark mode
setFilter('Protanopia');    // Apply red color blindness filter
setFilter(false);           // Remove filter
```

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

## TypeScript

All types are exported:

```tsx
import type {
  Location,           // { lon: number, lat: number }
  Bound,              // { minLon, minLat, maxLon, maxLat }
  BuiltInLayer,       // 'SIMPLE' | 'STREETS' | ...
  FilterType,         // 'Dark' | 'Light' | 'Protanopia' | 'Deuteranopia' | 'None'
  SphereMapInstance,  // Map instance type
  SphereMarker,       // Marker instance type
  SpherePolygon,      // Polygon instance type
} from 'gistda-sphere-react';
```

## License

MIT
