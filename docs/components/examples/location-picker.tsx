"use client";

import {
  type AddressResult,
  type Location,
  SphereMap,
  useSearch,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";

const BANGKOK = { lat: 13.7563, lon: 100.5018 };

type Lookup =
  | { state: "loading" }
  | { state: "found"; text: string }
  | { state: "missing" };

/** Joins the parts of an address into one line. */
function formatAddress(address: AddressResult): string {
  const parts = [
    address.road,
    address.subdistrict,
    address.district,
    address.province,
    address.postcode,
  ];
  return parts.filter(Boolean).join(", ");
}

/** What to show under the map for the current lookup. */
function describe(lookup: Lookup): string {
  if (lookup.state === "loading") {
    return "Looking up the address…";
  }
  if (lookup.state === "missing") {
    return "No address here, or your API key doesn't have the address service.";
  }
  return lookup.text;
}

/** Move the map under a fixed pin to pick a spot, and look up its address. */
export function LocationPicker() {
  const { address, isReady } = useSearch();
  const [center, setCenter] = useState<Location>(BANGKOK);
  const [lookup, setLookup] = useState<Lookup>({ state: "loading" });
  const [saved, setSaved] = useState<Location | null>(null);

  // Look up the center each time the map stops moving. An answer for an
  // older center is ignored, so a slow lookup never replaces a newer one.
  useEffect(() => {
    if (!isReady) {
      return;
    }
    let isCurrent = true;
    setLookup({ state: "loading" });
    address(center)
      .then((result) => {
        if (isCurrent) {
          setLookup(
            result
              ? { state: "found", text: formatAddress(result) }
              : { state: "missing" }
          );
        }
      })
      .catch(() => {
        if (isCurrent) {
          setLookup({ state: "missing" });
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [address, center, isReady]);

  return (
    <>
      <div style={{ position: "relative" }}>
        <SphereMap
          center={BANGKOK}
          onViewChange={(view) => setCenter(view.center)}
          style={{ height: 400 }}
          zoom={16}
        />
        {/* A pin fixed at the center. Clicks pass through to the map. */}
        <svg
          aria-hidden="true"
          height="40"
          style={{
            left: "50%",
            pointerEvents: "none",
            position: "absolute",
            top: "50%",
            transform: "translate(-50%, -100%)",
          }}
          viewBox="0 0 24 24"
          width="40"
        >
          <path
            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
            fill="#dc2626"
            stroke="white"
          />
        </svg>
      </div>
      <div className="controls">
        <output>
          {center.lat.toFixed(5)}, {center.lon.toFixed(5)}
        </output>
        <button onClick={() => setSaved(center)} type="button">
          Use this location
        </button>
        {saved ? (
          <small>
            Saved {saved.lat.toFixed(5)}, {saved.lon.toFixed(5)}
          </small>
        ) : null}
        <p>{describe(lookup)}</p>
      </div>
    </>
  );
}
