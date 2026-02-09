# gistda-sphere-react

> **Disclaimer**: This is an **unofficial** community project and is not affiliated with, endorsed by, or supported by GISTDA (Geo-Informatics and Space Technology Development Agency). For official documentation and support, please visit [sphere.gistda.or.th](https://sphere.gistda.or.th/).

> **Note**: This project is currently under active development. APIs may change between releases.

A React wrapper for the [GISTDA Sphere Map API](https://sphere.gistda.or.th/). Build interactive maps of Thailand with full TypeScript support.

**[Documentation](https://gistda-sphere-react.dulapahv.dev/docs)** | **[Playground](https://gistda-sphere-react.dulapahv.dev/playground)**

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
3. Create a new API key and set the allowed hosts to your domains (e.g. `localhost`, `yourdomain.com`)

> **Note**: The API key is sent as a query parameter in requests and is visible client-side. Use host restrictions as your primary security mechanism.

## Features

- **Components**: `SphereMap`, `Marker`, `Polygon`, `Polyline`, `Circle`, `Popup`, `Dot`, `Rectangle`, `Layer`
- **Hooks**: `useMap`, `useSphere`, `useMapControls`, `useSearch`, `useRoute`, `useTags`, `useMarkers`, `usePolygons`, `usePolylines`, `useCircles`, `useOverlays`
- **Event Hooks**: `useMapReady`, `useMapClick`, `useMapZoom`, `useMapLocation`, `useOverlayClick`, `useMapEvent`
- **Built-in Layers**: Traffic, PM2.5, Hotspot, Flood, Drought, Satellite imagery
- **Predefined Overlays**: Live CCTV cameras, traffic events, air quality data
- **Full TypeScript support** with exported types for all components, hooks, and options

For detailed API reference, examples, and interactive demos, visit the **[documentation](https://gistda-sphere-react.dulapahv.dev)**.

## License

MIT
