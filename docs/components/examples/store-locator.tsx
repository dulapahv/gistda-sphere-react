"use client";

import {
  type Location,
  Marker,
  MarkerCluster,
  Popup,
  SphereMap,
  useMapControls,
  useMapView,
  useSphereUtils,
} from "gistda-sphere-react";
import { useMemo, useState } from "react";

interface Store {
  id: number;
  name: string;
  position: Location;
}

const BANGKOK = { lat: 13.7563, lon: 100.5018 };
const AREAS = ["Siam", "Silom", "Sukhumvit", "Ari", "Thonburi", "Bang Na"];
const LIST_LENGTH = 8;

/** Pseudo-random numbers from a fixed seed, so the sample stores never move. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

/** Sample stores around Bangkok. Load yours from an API instead. */
function createStores(count: number): Store[] {
  const random = seededRandom(3);
  return Array.from({ length: count }, (_, id) => ({
    id,
    name: `${AREAS[id % AREAS.length]} ${Math.floor(id / AREAS.length) + 1}`,
    position: {
      lat: BANGKOK.lat + (random() - 0.5) * 0.4,
      lon: BANGKOK.lon + (random() - 0.5) * 0.5,
    },
  }));
}

const STORES = createStores(120);

/** Distance in meters between two locations (haversine formula). */
function distanceBetween(a: Location, b: Location): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

/** Clustered stores, a list of the nearest ones in view, and "near me". */
export function StoreLocator() {
  const view = useMapView();
  const { goTo } = useMapControls();
  const { formatDistance } = useSphereUtils();
  const [selected, setSelected] = useState<Store | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stores in view, nearest to the map center first. Updates when the map stops.
  const inView = useMemo(() => {
    if (!view) {
      return [];
    }
    const { bound, center } = view;
    return STORES.filter(
      ({ position: { lat, lon } }) =>
        lat >= bound.minLat &&
        lat <= bound.maxLat &&
        lon >= bound.minLon &&
        lon <= bound.maxLon
    )
      .map((store) => ({
        meters: distanceBetween(center, store.position),
        store,
      }))
      .sort((a, b) => a.meters - b.meters);
  }, [view]);

  const select = (store: Store) => {
    setSelected(store);
    goTo({ center: store.position, zoom: 15 });
  };

  const locate = () => {
    setError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        goTo({
          center: { lat: coords.latitude, lon: coords.longitude },
          zoom: 14,
        });
      },
      () => {
        setIsLocating(false);
        setError("Couldn't get your location. Check that the site may use it.");
      },
      { timeout: 10_000 }
    );
  };

  return (
    <>
      <SphereMap center={BANGKOK} style={{ height: 400 }} zoom={11}>
        <MarkerCluster
          getPosition={(store) => store.position}
          items={STORES}
          renderMarker={(store) => (
            <Marker
              onClick={() => setSelected(store)}
              position={store.position}
            />
          )}
        />
        {selected ? (
          <Popup
            detail="Open daily, 8:00 to 20:00"
            onClose={() => setSelected(null)}
            position={selected.position}
            title={selected.name}
          />
        ) : null}
      </SphereMap>
      <div className="controls">
        <button disabled={isLocating} onClick={locate} type="button">
          {isLocating ? "Locating…" : "Stores near me"}
        </button>
        <output>
          {inView.length} {inView.length === 1 ? "store" : "stores"} in view
        </output>
        {error ? <p role="alert">{error}</p> : null}
        {inView.length > 0 ? (
          <ol>
            {inView.slice(0, LIST_LENGTH).map(({ meters, store }) => (
              <li key={store.id}>
                <button onClick={() => select(store)} type="button">
                  {store.name} <small>{formatDistance(meters, "en")}</small>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <small>No stores in view. Zoom out to see more.</small>
        )}
      </div>
    </>
  );
}
