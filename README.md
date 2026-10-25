# gistda-sphere-react

> **Disclaimer**: This is an **unofficial** community project and is not affiliated with, endorsed by, or supported by GISTDA (Geo-Informatics and Space Technology Development Agency). For official documentation and support, please visit [sphere.gistda.or.th](https://sphere.gistda.or.th/).

> **Note**: This project is currently under active development. APIs may change between releases.

A React wrapper for the [GISTDA Sphere Map API](https://sphere.gistda.or.th/). Build interactive maps of Thailand with full TypeScript support.

**[Documentation](https://gistda-sphere-react.dulapahv.dev/docs)** | **[Playground](https://gistda-sphere-react.dulapahv.dev/playground)**

## Installation

```bash
npm install gistda-sphere-react
```

Requires React 19 or later.

## Quick start

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

## Getting an API key

1. Visit [sphere.gistda.or.th](https://sphere.gistda.or.th/) and register for an account.
2. Create an API key and add the hosts your app runs on (for example `localhost` and `yourdomain.com`).
3. Enable the services your app uses, such as search, routing or address lookup.

> **Note**: The API key is sent with every request and is visible in the browser. Host restrictions are what keep it safe.

## Features

- **The whole Sphere API**: every map class, event and option, mapped on the [API coverage](https://gistda-sphere-react.dulapahv.dev/docs/api-coverage) page.
- **Components**: `SphereMap`, `Marker`, `Popup`, `Polygon`, `Polyline`, `Circle`, `Rectangle`, `Dot`, `GeoJson`, `ObjectOverlay`, `Layer`, `Tag`, `PredefinedOverlay`, `MapControl`, `MenuBar`, `RouteGuide`, `SearchResults`
- **Hooks**: `useMap`, `useSphere`, `useMapControls`, `useUi`, `useSearch`, `useRoute`, `useTags`, `useTagCategories`, `useSphereUtils`, `useSphereServices`, overlay collections (`useMarkers`, `usePolygons`, `usePolylines`, `useCircles`, `useOverlays`) and event hooks (`useMapEvent`, `useMapReady`, `useMapClick`, `useMapZoom`, `useMapLocation`, `useOverlayClick`)
- **React content** in marker icons, popups and map controls
- **Routing** with status, totals and readable turn-by-turn directions as React state
- **Data and analysis**: GeoJSON, KML, GPX and WKT; heatmaps, clusters, 3D Tiles and I3S; measurements and polygon operations
- **Web services client** (`createSphereServices`) for search, routing, addresses, elevation, static maps, agriculture, disasters and population, in the browser or on a server
- **Full TypeScript support** with typed props, refs, results and events

For detailed API reference, examples, and interactive demos, visit the **[documentation](https://gistda-sphere-react.dulapahv.dev)**.

## License

MIT
