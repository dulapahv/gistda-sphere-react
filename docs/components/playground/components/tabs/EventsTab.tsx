"use client";

import { PulseIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { type EventLogStore, useEventEntries } from "../../hooks";
import type { PlaygroundTranslations } from "../../translations";
import { Button, Hint, Row, Section, Toggle } from "../ui";

/** Events tab: a live log of every map event. */
export function EventsTab({
  events,
  t,
}: {
  events: EventLogStore;
  t: PlaygroundTranslations;
}) {
  const entries = useEventEntries(events);
  const [verbose, setVerbose] = useState(events.isVerbose());

  return (
    <Section hint={t.events.hint} title={t.events.title(entries.length)}>
      <Row>
        <Toggle
          active={verbose}
          icon={PulseIcon}
          label={t.events.verbose}
          onClick={() => {
            events.setVerbose(!verbose);
            setVerbose(!verbose);
          }}
        />
        <Button
          disabled={entries.length === 0}
          icon={TrashIcon}
          label={t.common.clear}
          onClick={events.clear}
        />
      </Row>
      {entries.length === 0 ? (
        <Hint>{t.events.empty}</Hint>
      ) : (
        <ol className="m-0 mt-2 list-none rounded-md border border-fd-border bg-fd-secondary p-0 font-mono text-[11px]">
          {entries.map((entry) => (
            <li
              className="flex gap-2 border-fd-border border-b px-2 py-1 last:border-b-0"
              key={entry.id}
            >
              <span className="shrink-0 text-fd-muted-foreground tabular-nums">
                {entry.time}
              </span>
              <span className="shrink-0 font-semibold text-fd-primary">
                {entry.name}
              </span>
              <span className="min-w-0 flex-1 truncate text-fd-muted-foreground">
                {entry.detail}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
