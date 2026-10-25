"use client";

import { SphereServiceError, useSphereServices } from "gistda-sphere-react";
import { useState } from "react";

const VICTORY_MONUMENT = { lat: 13.7649, lon: 100.5383 };

/** Calls Sphere's web services with `useSphereServices` and shows the JSON. */
export function ServiceCalls() {
  const services = useSphereServices();
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const calls = [
    { label: "Tag categories", run: () => services.tags.categories() },
    {
      label: "Search “hospital”",
      run: () =>
        services.search.search("hospital", {
          limit: 3,
          near: VICTORY_MONUMENT,
        }),
    },
    {
      label: "Nearby places",
      run: () => services.poi.nearby(VICTORY_MONUMENT, { limit: 3 }),
    },
    { label: "Address", run: () => services.geo.address(VICTORY_MONUMENT) },
    { label: "Elevation", run: () => services.geo.elevation(VICTORY_MONUMENT) },
  ];

  const call = async (run: () => Promise<unknown>) => {
    setIsBusy(true);
    setError(null);
    try {
      setOutput(JSON.stringify(await run(), null, 2));
    } catch (reason) {
      setOutput("");
      setError(
        reason instanceof SphereServiceError
          ? `${reason.message} (code "${reason.code}")`
          : String(reason)
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="controls">
      {calls.map(({ label, run }) => (
        <button
          disabled={isBusy}
          key={label}
          onClick={() => call(run)}
          type="button"
        >
          {label}
        </button>
      ))}
      <small>
        Each button calls a Sphere web service around Victory Monument.
      </small>
      {error ? <p role="alert">{error}</p> : null}
      {output ? <pre>{output}</pre> : null}
    </div>
  );
}
