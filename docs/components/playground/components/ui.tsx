"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  CheckIcon,
  CircleNotchIcon,
  CopyIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

const BUTTON_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 font-medium text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const BUTTON_ON =
  "border-fd-primary bg-fd-primary text-fd-primary-foreground hover:opacity-90";
const BUTTON_OFF =
  "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground";

/** A titled block in the sidebar. */
export function Section({
  title,
  hint,
  children,
}: {
  children: ReactNode;
  hint?: ReactNode;
  title: string;
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {children}
      {hint ? <Hint>{hint}</Hint> : null}
    </section>
  );
}

/** Wrapping row of buttons. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

/** A button that shows an on/off state. */
export function Toggle({
  active,
  onClick,
  icon: Icon,
  label,
  disabled,
  title,
}: {
  active: boolean;
  disabled?: boolean;
  icon?: PhosphorIcon;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={`${BUTTON_BASE} ${active ? BUTTON_ON : BUTTON_OFF}`}
      disabled={disabled}
      onClick={onClick}
      title={title ?? label}
      type="button"
    >
      {Icon ? <Icon size={14} /> : null}
      <span>{label}</span>
    </button>
  );
}

/** A plain action button. */
export function Button({
  onClick,
  icon: Icon,
  label,
  disabled,
  primary,
  title,
  busy,
}: {
  busy?: boolean;
  disabled?: boolean;
  icon?: PhosphorIcon;
  label?: string;
  onClick: () => void;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button
      aria-label={label ? undefined : title}
      className={`${BUTTON_BASE} ${primary ? BUTTON_ON : BUTTON_OFF}`}
      disabled={disabled || busy}
      onClick={onClick}
      title={title ?? label}
      type="button"
    >
      {busy ? <CircleNotchIcon className="animate-spin" size={14} /> : null}
      {!busy && Icon ? <Icon size={14} /> : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}

/** Secondary explanatory text. */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-fd-muted-foreground text-xs leading-relaxed">
      {children}
    </p>
  );
}

/** An inline error message. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-2 flex items-start gap-1.5 rounded-md border border-fd-error/40 bg-fd-error/10 px-2 py-1.5 text-fd-error text-xs"
      role="alert"
    >
      <WarningIcon className="mt-0.5 shrink-0" size={13} />
      <span>{children}</span>
    </p>
  );
}

/** A label/value line in a stats box. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5 text-xs">
      <span className="text-fd-muted-foreground">{label}</span>
      <span className="text-right font-medium text-fd-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** A bordered box for results. */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-md border border-fd-border bg-fd-secondary px-2.5 py-2">
      {children}
    </div>
  );
}

/** Pretty-printed JSON with a size cap. */
export function JsonView({ data }: { data: unknown }) {
  const text = data === undefined ? "undefined" : JSON.stringify(data, null, 2);
  return (
    <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-fd-border bg-fd-muted p-2 font-mono text-[10.5px] text-fd-foreground leading-snug">
      {text.length > 6000 ? `${text.slice(0, 6000)}\n…` : text}
    </pre>
  );
}

/** A labeled range slider. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled,
}: {
  disabled?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  value: number;
}) {
  return (
    <label className="mb-2 block text-xs">
      <span className="flex justify-between text-fd-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {Math.round(value)}
          {unit}
        </span>
      </span>
      <input
        className="mt-1 w-full accent-fd-primary"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

/** Copies text (or text produced on click) to the clipboard and confirms. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  disabled,
}: {
  copiedLabel: string;
  disabled?: boolean;
  label: string;
  text: string | (() => string);
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof text === "function" ? text() : text
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button
      disabled={disabled}
      icon={copied ? CheckIcon : CopyIcon}
      label={copied ? copiedLabel : label}
      onClick={copy}
    />
  );
}

/** Saves text as a file download. */
export function downloadText(fileName: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** A labeled multi-line text input. */
export function TextArea({
  label,
  onChange,
  placeholder,
  rows = 6,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block text-xs">
      <span className="sr-only">{label}</span>
      <textarea
        className="w-full resize-y rounded-md border border-fd-border bg-fd-background p-2 font-mono text-[11px] text-fd-foreground leading-snug placeholder:text-fd-muted-foreground focus:border-fd-ring focus:outline-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        value={value}
      />
    </label>
  );
}

/** A labeled single-line text input. */
export function TextInput({
  label,
  onChange,
  onEnter,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <input
      aria-label={label}
      className="w-full min-w-0 flex-1 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-fd-foreground text-xs placeholder:text-fd-muted-foreground focus:border-fd-ring focus:outline-none"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onEnter?.();
        }
      }}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  );
}

/** A labeled drop-down. */
export function Select<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ label: string; value: T }>;
  value: T;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="shrink-0 text-fd-muted-foreground">{label}</span>
      <select
        className="w-full min-w-0 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 text-fd-foreground text-xs focus:border-fd-ring focus:outline-none"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
