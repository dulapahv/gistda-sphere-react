"use client";

import { DatabaseIcon, PathIcon } from "@phosphor-icons/react";
import type { Location, PoiResult } from "gistda-sphere-react";
import type { PlaygroundTranslations } from "../translations";
import { Button, CopyButton } from "./ui";

/** Formats a location as "lat, lon". */
export function formatLocation(location: Location, digits = 5): string {
  return `${location.lat.toFixed(digits)}, ${location.lon.toFixed(digits)}`;
}

/** A round numbered badge, used as a React marker icon. */
export function NumberBadge({ value }: { value: number }) {
  return (
    <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 font-semibold text-[11px] text-white shadow-md">
      {value}
    </span>
  );
}

/** Popup content for a place, rendered by React inside the Sphere popup. */
export function PlaceCard({
  poi,
  t,
}: {
  poi: PoiResult;
  t: PlaygroundTranslations;
}) {
  return (
    <div className="flex max-w-60 flex-col gap-1 text-xs">
      {poi.address ? <p className="m-0">{poi.address}</p> : null}
      {poi.tel ? (
        <a className="text-blue-600" href={`tel:${poi.tel}`}>
          {poi.tel}
        </a>
      ) : null}
      {poi.tag?.length ? (
        <p className="m-0 opacity-70">{poi.tag.join(" · ")}</p>
      ) : null}
      <p className="m-0 font-mono text-[10.5px] opacity-70">
        {formatLocation({ lat: poi.lat, lon: poi.lon })}
      </p>
      <p className="m-0 font-mono text-[10.5px] opacity-50">
        {t.places.poiId(poi.id)}
      </p>
    </div>
  );
}

/** Popup content for a clicked point on the map. */
export function InspectCard({
  onAddRouteStop,
  onAnalyzeHere,
  point,
  t,
}: {
  onAddRouteStop: (location: Location) => void;
  onAnalyzeHere: (location: Location) => void;
  point: Location;
  t: PlaygroundTranslations;
}) {
  const text = formatLocation(point, 6);
  return (
    <div className="flex flex-col gap-2 text-xs">
      <p className="m-0 font-mono">{text}</p>
      <div className="flex flex-wrap gap-1">
        <CopyButton
          copiedLabel={t.common.copied}
          label={t.common.copy}
          text={text}
        />
        <Button
          icon={PathIcon}
          label={t.inspect.addStop}
          onClick={() => onAddRouteStop(point)}
        />
        <Button
          icon={DatabaseIcon}
          label={t.inspect.analyze}
          onClick={() => onAnalyzeHere(point)}
        />
      </div>
    </div>
  );
}
