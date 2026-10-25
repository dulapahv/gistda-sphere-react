"use client";

import { ObjectOverlay, SphereMap } from "gistda-sphere-react";
import { useState } from "react";

/** Province area IDs, as found in search results. */
const PROVINCES = [
  { id: "A10000000", name: "Bangkok" },
  { id: "A50000000", name: "Chiang Mai" },
  { id: "A83000000", name: "Phuket" },
];

interface Status {
  isError: boolean;
  text: string;
}

/** Loads a province's outline by its ID with `<ObjectOverlay>`. */
export function ProvinceOutline() {
  const [provinceId, setProvinceId] = useState("A10000000");
  const [status, setStatus] = useState<Status | null>(null);
  const province = PROVINCES.find(({ id }) => id === provinceId);

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={8}
      >
        <ObjectOverlay
          fillColor="rgba(59, 130, 246, 0.15)"
          fitBounds
          id={provinceId}
          key={provinceId}
          lineColor="rgb(37, 99, 235)"
          lineWidth={2}
          onError={() =>
            setStatus({
              isError: true,
              text: "The outline didn't load. Your API key may not have the POI details service (poi/get).",
            })
          }
          onLoad={() =>
            setStatus({
              isError: false,
              text: `Loaded the outline of ${province?.name}.`,
            })
          }
          timeout={10_000}
        />
      </SphereMap>
      <div className="controls">
        {PROVINCES.map(({ id, name }) => (
          <button
            aria-pressed={provinceId === id}
            key={id}
            onClick={() => {
              setProvinceId(id);
              setStatus(null);
            }}
            type="button"
          >
            {name}
          </button>
        ))}
        {status ? (
          <p role={status.isError ? "alert" : "status"}>{status.text}</p>
        ) : null}
      </div>
    </>
  );
}
