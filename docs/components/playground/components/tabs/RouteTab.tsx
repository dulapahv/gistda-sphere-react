"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  ArrowBendUpLeftIcon,
  ArrowBendUpRightIcon,
  ArrowsClockwiseIcon,
  ArrowsLeftRightIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  ArrowUUpLeftIcon,
  BoatIcon,
  BookOpenIcon,
  CrosshairIcon,
  CursorClickIcon,
  FlagCheckeredIcon,
  MapPinPlusIcon,
  MotorcycleIcon,
  NavigationArrowIcon,
  PathIcon,
  SignpostIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  ROUTE_TURN,
  type RouteErrorInfo,
  RouteGuide,
  type RouteLabelType,
  type RouteMode,
  type RouteStep,
  type UseRouteReturn,
  useMapControls,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";
import { ROUTE_MODES } from "../../constants";
import type { PlaygroundTranslations } from "../../translations";
import type { PickMode } from "../../types";
import { formatLocation } from "../MapCards";
import {
  Button,
  CopyButton,
  ErrorNote,
  Hint,
  Panel,
  Row,
  Section,
  Stat,
  Toggle,
} from "../ui";

const TURN_ICONS: Record<number, PhosphorIcon> = {
  [ROUTE_TURN.TurnLeft]: ArrowBendUpLeftIcon,
  [ROUTE_TURN.TurnRight]: ArrowBendUpRightIcon,
  [ROUTE_TURN.SlightLeft]: ArrowUpLeftIcon,
  [ROUTE_TURN.SlightRight]: ArrowUpRightIcon,
  [ROUTE_TURN.HeadToward]: NavigationArrowIcon,
  [ROUTE_TURN.Straight]: ArrowUpIcon,
  [ROUTE_TURN.EnterExpressway]: SignpostIcon,
  [ROUTE_TURN.UTurn]: ArrowUUpLeftIcon,
  [ROUTE_TURN.Arrive]: FlagCheckeredIcon,
  [ROUTE_TURN.Ferry]: BoatIcon,
};

const LABELS: readonly RouteLabelType[] = ["Distance", "Time", "Hide"];

/** Explains a routing error in the playground's language. */
function describeRouteError(
  t: PlaygroundTranslations,
  error: RouteErrorInfo
): string {
  if (error.code === "timeout") {
    return t.route.timeout;
  }
  if (error.code === "exception") {
    return t.route.exception(error.message);
  }
  return t.route.failed(error.code, error.message);
}

/** One turn-by-turn instruction. */
function StepItem({ index, step }: { index: number; step: RouteStep }) {
  const Icon = TURN_ICONS[step.turn] ?? ArrowUpIcon;
  return (
    <li className="flex items-start gap-2 border-fd-border border-b px-2 py-1.5 last:border-b-0">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-fd-accent text-fd-foreground">
        <Icon size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[11.5px] text-fd-foreground">
          <span className="text-fd-muted-foreground">{index + 1}. </span>
          {step.instruction}
        </p>
        <p className="m-0 text-[10.5px] text-fd-muted-foreground tabular-nums">
          {[step.distanceText, step.intervalText].filter(Boolean).join(" · ")}
        </p>
      </div>
    </li>
  );
}

/** PathIcon tab: stops, travel mode, options, summary and turn-by-turn steps. */
export function RouteTab({
  onPickModeChange,
  pickMode,
  route,
  t,
}: {
  onPickModeChange: (mode: PickMode | null) => void;
  pickMode: PickMode | null;
  route: UseRouteReturn;
  t: PlaygroundTranslations;
}) {
  const { getCenter } = useMapControls();
  const [mode, setMode] = useState<RouteMode>("Traffic");
  const [avoidTollways, setAvoidTollways] = useState(false);
  const [avoidFerries, setAvoidFerries] = useState(false);
  const [motorcycle, setMotorcycle] = useState(false);
  const [label, setLabel] = useState<RouteLabelType>("Distance");
  const [auto, setAuto] = useState(false);
  const [contextMenu, setContextMenu] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSteps, setShowSteps] = useState(true);

  // Start from Sphere's current settings.
  const { getAuto, getLabel, getMode, isReady } = route;
  useEffect(() => {
    if (!isReady) {
      return;
    }
    setMode(getMode() ?? "Traffic");
    setLabel(getLabel() ?? "Distance");
    setAuto(getAuto() ?? false);
  }, [isReady, getAuto, getLabel, getMode]);

  const changeMode = (next: RouteMode) => {
    setMode(next);
    route.setMode(next);
  };

  const addCenter = () => {
    const center = getCenter();
    if (center) {
      route.addDestination(center);
    }
  };

  const clearAll = () => {
    route.clear();
    onPickModeChange(null);
  };

  // Includes stops users dragged or removed on the map.
  const { destinations: stops, error, status, steps, summary } = route;
  const picking = pickMode === "routeStop";

  return (
    <>
      <Section hint={t.route.stopsHint} title={t.route.stops(stops.length)}>
        {stops.length > 0 ? (
          <ol className="m-0 mb-2 flex list-none flex-col gap-1 p-0">
            {stops.map((stop, index) => (
              <li
                className="flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2 py-1 text-xs"
                key={`${stop.lat},${stop.lon}`}
              >
                <span className="w-16 shrink-0 font-medium">
                  {t.route.stopName(index, stops.length)}
                </span>
                <span className="min-w-0 flex-1 truncate text-fd-muted-foreground tabular-nums">
                  {formatLocation(stop, 4)}
                </span>
                <Button
                  icon={XIcon}
                  onClick={() => route.removeDestinationAt(index)}
                  title={t.common.remove}
                />
              </li>
            ))}
          </ol>
        ) : null}
        <Row>
          <Toggle
            active={picking}
            icon={MapPinPlusIcon}
            label={picking ? t.route.picking : t.route.pickOnMap}
            onClick={() => onPickModeChange(picking ? null : "routeStop")}
          />
          <Button
            icon={CrosshairIcon}
            label={t.route.addCenter}
            onClick={addCenter}
          />
          <Button
            disabled={stops.length < 2}
            icon={ArrowsLeftRightIcon}
            onClick={() => route.reverse()}
            title={t.route.reverse}
          />
          <Button
            icon={TrashIcon}
            onClick={clearAll}
            title={t.common.clearAll}
          />
        </Row>
      </Section>

      <Section title={t.route.mode}>
        <Row>
          {ROUTE_MODES.map(({ icon, id }) => (
            <Toggle
              active={mode === id}
              icon={icon}
              key={id}
              label={t.route.modes[id]}
              onClick={() => changeMode(id)}
            />
          ))}
        </Row>
        <Hint>{t.route.modeHint[mode]}</Hint>
      </Section>

      <Section title={t.route.options}>
        <Row>
          <Toggle
            active={avoidTollways}
            label={t.route.avoidTollways}
            onClick={() => {
              route.enableRouteType("Tollway", avoidTollways);
              setAvoidTollways(!avoidTollways);
            }}
          />
          <Toggle
            active={avoidFerries}
            icon={BoatIcon}
            label={t.route.avoidFerries}
            onClick={() => {
              route.enableRouteType("Ferry", avoidFerries);
              setAvoidFerries(!avoidFerries);
            }}
          />
          <Toggle
            active={motorcycle}
            icon={MotorcycleIcon}
            label={t.route.motorcycle}
            onClick={() => {
              route.setRestrict("Bike", !motorcycle);
              setMotorcycle(!motorcycle);
            }}
          />
        </Row>
        <p className="mt-3 mb-1.5 text-fd-muted-foreground text-xs">
          {t.route.labels}
        </p>
        <Row>
          {LABELS.map((option) => (
            <Toggle
              active={label === option}
              key={option}
              label={t.route.label[option]}
              onClick={() => {
                route.setLabel(option);
                setLabel(option);
              }}
            />
          ))}
        </Row>
        <div className="mt-3">
          <Row>
            <Toggle
              active={auto}
              icon={ArrowsClockwiseIcon}
              label={t.route.auto}
              onClick={() => {
                route.setAuto(!auto);
                setAuto(!auto);
              }}
            />
            <Toggle
              active={contextMenu}
              disabled={contextMenu}
              icon={CursorClickIcon}
              label={t.route.contextMenu}
              onClick={() => {
                route.enableContextMenu();
                setContextMenu(true);
                setAuto(true);
              }}
            />
          </Row>
        </div>
        <Hint>{t.route.optionsHint}</Hint>
      </Section>

      <Section title={t.route.result}>
        <Button
          busy={status === "calculating"}
          disabled={stops.length < 2 || !route.isReady}
          icon={PathIcon}
          label={
            status === "calculating" ? t.route.calculating : t.route.calculate
          }
          onClick={route.search}
          primary
        />
        {stops.length < 2 ? <Hint>{t.route.needStops}</Hint> : null}
        {error ? <ErrorNote>{describeRouteError(t, error)}</ErrorNote> : null}
        {summary ? (
          <Panel>
            <Stat label={t.route.distance} value={summary.distanceText} />
            <Stat
              label={t.route.duration}
              value={summary.intervalText || "–"}
            />
            <Stat label={t.route.steps} value={steps.length} />
          </Panel>
        ) : null}
        {summary ? (
          <div className="mt-2">
            <Row>
              <Toggle
                active={showSteps}
                icon={NavigationArrowIcon}
                label={t.route.turnByTurn}
                onClick={() => setShowSteps(!showSteps)}
              />
              <CopyButton
                copiedLabel={t.common.copied}
                label={t.route.copyGeoJson}
                text={() =>
                  JSON.stringify(route.exportRouteLine()?.toJSON() ?? null)
                }
              />
            </Row>
          </div>
        ) : null}
        {summary && showSteps && steps.length > 0 ? (
          <ol className="m-0 mt-2 max-h-80 list-none overflow-y-auto rounded-md border border-fd-border bg-fd-secondary p-0">
            {steps.map((step, index) => (
              <StepItem
                index={index}
                // Steps are rebuilt per route and never reordered.
                // biome-ignore lint/suspicious/noArrayIndexKey: steps have no ids
                key={index}
                step={step}
              />
            ))}
          </ol>
        ) : null}
      </Section>

      <Section hint={t.route.builtInGuideHint} title={t.route.builtInGuide}>
        <Toggle
          active={showGuide}
          icon={BookOpenIcon}
          label={showGuide ? t.common.hide : t.common.show}
          onClick={() => {
            if (!showGuide) {
              setAuto(true);
            }
            setShowGuide(!showGuide);
          }}
        />
        {showGuide ? (
          <RouteGuide className="mt-2 max-h-96 overflow-y-auto rounded-md border border-fd-border bg-white text-black text-xs" />
        ) : null}
      </Section>
    </>
  );
}
