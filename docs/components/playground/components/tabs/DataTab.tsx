"use client";

import {
  ArrowSquareOutIcon,
  CrosshairIcon,
  MapPinPlusIcon,
  PlayIcon,
  StopIcon,
} from "@phosphor-icons/react";
import {
  type GeoJSONPolygon,
  type Language,
  type Location,
  type RasterTileLayer,
  SphereServiceError,
  type SphereServices,
  type StaticMapStyle,
  useMapControls,
  useSphereContext,
  useSphereServices,
} from "gistda-sphere-react";
import { useEffect, useRef, useState } from "react";
import type { PlaygroundTranslations } from "../../translations";
import type { PickMode } from "../../types";
import { formatLocation } from "../MapCards";
import {
  Button,
  CopyButton,
  ErrorNote,
  Hint,
  JsonView,
  Panel,
  Row,
  Section,
  Select,
  TextInput,
  Toggle,
} from "../ui";

/** Destinations used by the routing samples. */
const VICTORY_MONUMENT: Location = { lat: 13.7649, lon: 100.5383 };
const WAT_ARUN: Location = { lat: 13.7437, lon: 100.4889 };

/** A small square polygon around a point, for area-based services. */
function squareAround(point: Location, half = 0.01): GeoJSONPolygon {
  const { lat, lon } = point;
  return {
    coordinates: [
      [
        [lon - half, lat - half],
        [lon + half, lat - half],
        [lon + half, lat + half],
        [lon - half, lat + half],
        [lon - half, lat - half],
      ],
    ],
    type: "Polygon",
  };
}

/** The same square as well-known text. */
function squareWkt(point: Location, half = 0.01): string {
  const ring = squareAround(point, half).coordinates[0] ?? [];
  return `POLYGON((${ring.map(([x, y]) => `${x} ${y}`).join(",")}))`;
}

type ServiceGroup = "geo" | "poi" | "route" | "agri" | "disaster" | "people";

interface ServiceContext {
  keyword: string;
  locale: Language;
  poiId: string;
  point: Location;
  services: SphereServices;
  signal: AbortSignal;
}

interface ServiceDefinition {
  group: ServiceGroup;
  /** Extra input the service needs. */
  input?: "keyword" | "poiId";
  /** REST path, shown next to the result. */
  path: string;
  run: (context: ServiceContext) => Promise<unknown>;
}

const SERVICES = {
  address: {
    group: "geo",
    path: "geo/address",
    run: ({ locale, point, services, signal }) =>
      services.geo.address(point, { locale, signal }),
  },
  cassava: {
    group: "agri",
    path: "agri/cassava-biweekly-50m",
    run: ({ point, services, signal }) =>
      services.agri.cassava(point, { signal }),
  },
  categories: {
    group: "poi",
    path: "category/all",
    run: ({ services, signal }) => services.tags.categories({ signal }),
  },
  crop: {
    group: "agri",
    path: "info/crop",
    run: ({ point, services, signal }) => services.info.crop(point, { signal }),
  },
  cropSuitability: {
    group: "agri",
    path: "info/crop-suitability",
    run: ({ point, services, signal }) =>
      services.info.cropSuitability(squareAround(point), { signal }),
  },
  disasterRecurring: {
    group: "disaster",
    path: "info/disaster-recurring/v2",
    run: ({ point, services, signal }) =>
      services.info.disasterRecurring(point, { signal, version: 2 }),
  },
  drought: {
    group: "disaster",
    path: "info/disaster-drought",
    run: ({ point, services, signal }) =>
      services.info.drought(point, { signal }),
  },
  droughtRecurrence: {
    group: "disaster",
    path: "info/disasters/drought-recurrence",
    run: ({ point, services, signal }) =>
      services.info.droughtRecurrence(squareAround(point), { signal }),
  },
  elevation: {
    group: "geo",
    path: "geo/elevation",
    run: ({ point, services, signal }) =>
      services.geo.elevation(point, { signal }),
  },
  flood: {
    group: "disaster",
    path: "info/disaster-flood",
    run: ({ point, services, signal }) =>
      services.info.flood(point, { signal }),
  },
  floodRecurrence: {
    group: "disaster",
    path: "info/disasters/flood-recurrence",
    run: ({ point, services, signal }) =>
      services.info.floodRecurrence(squareAround(point), { signal }),
  },
  hotspot: {
    group: "disaster",
    path: "info/disaster-hotspot",
    run: ({ point, services, signal }) =>
      services.info.hotspot({ location: point, radius: 10_000, signal }),
  },
  landSuitability: {
    group: "agri",
    path: "info/land-suitability",
    run: ({ point, services, signal }) =>
      services.info.landSuitability(point, { signal }),
  },
  maize: {
    group: "agri",
    path: "agri/maize-biweekly-50m",
    run: ({ point, services, signal }) =>
      services.agri.maize(point, { signal }),
  },
  matrix: {
    group: "route",
    path: "route/matrix",
    run: ({ point, services, signal }) =>
      services.route.matrix({
        from: [point],
        signal,
        to: [VICTORY_MONUMENT, WAT_ARUN],
      }),
  },
  nearby: {
    group: "poi",
    path: "poi/search",
    run: ({ locale, point, services, signal }) =>
      services.poi.nearby(point, { limit: 5, locale, signal }),
  },
  palm: {
    group: "agri",
    path: "agri/palm-yearly-50m",
    run: ({ point, services, signal }) => services.agri.palm(point, { signal }),
  },
  poi: {
    group: "poi",
    input: "poiId",
    path: "poi/get",
    run: ({ locale, poiId, services, signal }) =>
      services.poi.get(poiId.trim(), { locale, signal }),
  },
  population: {
    group: "people",
    path: "population/facebook",
    run: ({ point, services, signal }) =>
      services.population.get(squareWkt(point), { signal }),
  },
  rice: {
    group: "agri",
    path: "agri/rice-biweekly-50m",
    run: ({ point, services, signal }) => services.agri.rice(point, { signal }),
  },
  route: {
    group: "route",
    path: "route/route",
    run: ({ locale, point, services, signal }) =>
      services.route.route({
        from: point,
        guide: "turns",
        locale,
        signal,
        to: VICTORY_MONUMENT,
      }),
  },
  rubber: {
    group: "agri",
    path: "agri/rubber-yearly-50m",
    run: ({ point, services, signal }) =>
      services.agri.rubber(point, { signal }),
  },
  search: {
    group: "poi",
    input: "keyword",
    path: "search/search",
    run: ({ keyword, locale, point, services, signal }) =>
      services.search.search(keyword, {
        limit: 5,
        locale,
        near: point,
        showDistance: true,
        signal,
      }),
  },
  sugarcane: {
    group: "agri",
    path: "agri/sugarcane-biweekly-50m",
    run: ({ point, services, signal }) =>
      services.agri.sugarcane(point, { signal }),
  },
  suggest: {
    group: "poi",
    input: "keyword",
    path: "search/suggest",
    run: ({ keyword, services, signal }) =>
      services.search.suggest(keyword, { limit: 5, signal }),
  },
} satisfies Record<string, ServiceDefinition>;

type ServiceId = keyof typeof SERVICES;

const GROUP_ORDER: readonly ServiceGroup[] = [
  "geo",
  "poi",
  "route",
  "agri",
  "disaster",
  "people",
];

const STATIC_STYLES: readonly StaticMapStyle[] = [
  "sphere_streets",
  "sphere_streets_en",
  "sphere_hybrid",
  "sphere_hybrid_en",
  "thailand_images",
];

const RASTER_LAYERS: readonly RasterTileLayer[] = [
  "sphere_streets",
  "sphere_hybrid",
  "thailand_images",
  "sphere_protanopia",
  "sphere_deuteranopia",
];

const KEY_PLACEHOLDER = "YOUR_API_KEY";

/** Explains a failed service call in plain words. */
function describeError(t: PlaygroundTranslations, reason: unknown): string {
  if (reason instanceof SphereServiceError) {
    return `${t.data.errors[reason.code]} (${reason.service})`;
  }
  return reason instanceof Error ? reason.message : String(reason);
}

interface CallResult {
  data?: unknown;
  error?: string;
  ms: number;
  path: string;
}

/** Data tab: Sphere REST web services, static/embed maps and tile URLs. */
export function DataTab({
  language,
  onPickModeChange,
  onPointChange,
  pickMode,
  point,
  t,
}: {
  language: Language;
  onPickModeChange: (mode: PickMode | null) => void;
  onPointChange: (point: Location) => void;
  pickMode: PickMode | null;
  /** Location the services are asked about. */
  point: Location;
  t: PlaygroundTranslations;
}) {
  const services = useSphereServices({ locale: language });
  const { apiKey } = useSphereContext();
  const { getCenter } = useMapControls();
  const [serviceId, setServiceId] = useState<ServiceId>("address");
  const [keyword, setKeyword] = useState("โรงพยาบาล");
  const [poiId, setPoiId] = useState("A10000000");
  const [result, setResult] = useState<CallResult | null>(null);
  const [running, setRunning] = useState(false);
  const [staticStyle, setStaticStyle] =
    useState<StaticMapStyle>("sphere_streets");
  const [staticFailed, setStaticFailed] = useState(false);
  const [rasterLayer, setRasterLayer] =
    useState<RasterTileLayer>("sphere_streets");
  const controllerRef = useRef<AbortController | null>(null);

  const service: ServiceDefinition = SERVICES[serviceId];
  const picking = pickMode === "dataPoint";

  const run = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);
    const started = performance.now();
    try {
      const data = await service.run({
        keyword,
        locale: language,
        poiId,
        point,
        services,
        signal: controller.signal,
      });
      setResult({ data, ms: performance.now() - started, path: service.path });
    } catch (reason) {
      setResult({
        error: describeError(t, reason),
        ms: performance.now() - started,
        path: service.path,
      });
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(false);
      }
    }
  };

  const mask = (url: string) => url.replaceAll(apiKey, KEY_PLACEHOLDER);
  const staticUrl = services.maps.staticMapUrl({
    center: point,
    features: [
      {
        geometry: { coordinates: [point.lon, point.lat], type: "Point" },
        properties: { linecolor: "#7c3aed", linewidth: 10 },
        type: "Feature",
      },
    ],
    height: 200,
    map: staticStyle,
    width: 320,
    zoom: 14,
  });
  const embedUrl = services.maps.embedUrl({
    center: point,
    locale: language,
    marker: true,
    zoom: 14,
  });
  // Probe the image separately: a failed static map (e.g. a key without the
  // service) should show an explanation instead of a broken image.
  useEffect(() => {
    setStaticFailed(false);
    const probe = new Image();
    probe.onerror = () => setStaticFailed(true);
    probe.src = staticUrl;
    return () => {
      probe.onerror = null;
    };
  }, [staticUrl]);

  const tileUrls: [label: string, url: string][] = [
    [t.data.rasterTiles, services.maps.rasterTileUrl(rasterLayer)],
    [t.data.vectorTiles, services.maps.vectorTileUrl()],
    [t.data.vectorStyle, services.maps.vectorStyleUrl("streets")],
    [t.data.wmts, services.maps.wmtsCapabilitiesUrl()],
  ];

  return (
    <>
      <Section hint={t.data.pointHint} title={t.data.point}>
        <Panel>
          <p className="m-0 font-mono text-xs">{formatLocation(point, 5)}</p>
        </Panel>
        <div className="mt-2">
          <Row>
            <Toggle
              active={picking}
              icon={MapPinPlusIcon}
              label={picking ? t.data.picking : t.data.pickOnMap}
              onClick={() => onPickModeChange(picking ? null : "dataPoint")}
            />
            <Button
              icon={CrosshairIcon}
              label={t.data.useCenter}
              onClick={() => {
                const center = getCenter();
                if (center) {
                  onPointChange(center);
                }
              }}
            />
          </Row>
        </div>
      </Section>

      <Section hint={t.data.servicesHint} title={t.data.services}>
        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">{t.data.services}</span>
          <select
            className="w-full rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-fd-foreground text-xs focus:border-fd-ring focus:outline-none"
            onChange={(event) => {
              setServiceId(event.target.value as ServiceId);
              setResult(null);
            }}
            value={serviceId}
          >
            {GROUP_ORDER.map((group) => (
              <optgroup key={group} label={t.data.groups[group]}>
                {(Object.keys(SERVICES) as ServiceId[])
                  .filter((id) => SERVICES[id].group === group)
                  .map((id) => (
                    <option key={id} value={id}>
                      {t.data.service[id]}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        {service.input === "keyword" ? (
          <div className="mt-2 flex">
            <TextInput
              label={t.data.keyword}
              onChange={setKeyword}
              onEnter={run}
              placeholder={t.data.keyword}
              value={keyword}
            />
          </div>
        ) : null}
        {service.input === "poiId" ? (
          <div className="mt-2 flex">
            <TextInput
              label={t.data.poiId}
              onChange={setPoiId}
              onEnter={run}
              placeholder={t.data.poiId}
              value={poiId}
            />
          </div>
        ) : null}
        <Hint>{t.data.serviceInfo[serviceId]}</Hint>
        <div className="mt-2">
          <Row>
            <Button
              busy={running}
              icon={PlayIcon}
              label={t.data.run}
              onClick={run}
              primary
            />
            {running ? (
              <Button
                icon={StopIcon}
                label={t.common.cancel}
                onClick={() => controllerRef.current?.abort()}
              />
            ) : null}
          </Row>
        </div>
        {result ? (
          <>
            <p className="mt-2 mb-0 font-mono text-[11px] text-fd-muted-foreground">
              GET /services/{result.path} · {Math.round(result.ms)} ms
            </p>
            {result.error ? (
              <ErrorNote>{result.error}</ErrorNote>
            ) : (
              <JsonView data={result.data} />
            )}
          </>
        ) : null}
      </Section>

      <Section hint={t.data.staticHint} title={t.data.staticMap}>
        <Select
          label={t.data.style}
          onChange={setStaticStyle}
          options={STATIC_STYLES.map((style) => ({
            label: style,
            value: style,
          }))}
          value={staticStyle}
        />
        {staticFailed ? null : (
          // biome-ignore lint/performance/noImgElement: the image comes from the Sphere static map service
          <img
            alt={t.data.staticAlt}
            className="mt-2 h-50 w-80 max-w-full rounded-md border border-fd-border bg-fd-muted object-cover"
            height={200}
            key={staticUrl}
            src={staticUrl}
            width={320}
          />
        )}
        {staticFailed ? <ErrorNote>{t.data.staticFailed}</ErrorNote> : null}
        <div className="mt-2">
          <Row>
            <CopyButton
              copiedLabel={t.common.copied}
              label={t.data.copyUrl}
              text={mask(staticUrl)}
            />
            <a
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-secondary-foreground text-xs no-underline hover:border-fd-ring hover:bg-fd-accent"
              href={embedUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ArrowSquareOutIcon size={14} />
              {t.data.openEmbed}
            </a>
          </Row>
        </div>
      </Section>

      <Section hint={t.data.tilesHint} title={t.data.tiles}>
        <Select
          label={t.data.rasterLayer}
          onChange={setRasterLayer}
          options={RASTER_LAYERS.map((layer) => ({
            label: layer,
            value: layer,
          }))}
          value={rasterLayer}
        />
        <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
          {tileUrls.map(([label, url]) => (
            <li key={label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{label}</span>
                <CopyButton
                  copiedLabel={t.common.copied}
                  label={t.common.copy}
                  text={mask(url)}
                />
              </div>
              <code className="block break-all rounded bg-fd-muted px-1.5 py-1 text-[10.5px]">
                {mask(url)}
              </code>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
