import type {
  FilterType,
  FilterValue,
  LineStyleType,
  LineStyleValue,
  RouteLabelType,
  RouteLabelValue,
  RouteLineType,
  RouteLineValue,
  RouteMode,
  RouteModeValue,
  RouteRestrictType,
  RouteType,
  RouteTypeValue,
  SphereNamespace,
  UiComponentMode,
  UiComponentValue,
} from "@/types";

/**
 * Converters between this library's friendly enum names and the values the
 * Sphere runtime actually uses (e.g. `"Dashed"` -> `[6, 4]`, `"Traffic"` -> `"t"`).
 * Lookups go through `window.sphere` so they always match the loaded script.
 */

/** Compares runtime enum values, treating arrays (dash patterns) by content. */
function sameEnumValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }
  return a === b;
}

/** Finds the friendly key of a runtime enum value. */
function findEnumKey<K extends string>(
  record: Partial<Record<K, unknown>> | undefined,
  value: unknown
): K | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of Object.keys(record) as K[]) {
    if (sameEnumValue(record[key], value)) {
      return key;
    }
  }
  return undefined;
}

/** Resolves a line style name (or custom dash array) to the runtime dash array. */
export function toLineStyleValue(
  sphere: SphereNamespace,
  style: LineStyleType | LineStyleValue | undefined
): LineStyleValue | undefined {
  if (style === undefined) {
    return undefined;
  }
  if (Array.isArray(style)) {
    return style;
  }
  return sphere.LineStyle[style];
}

/** Resolves a filter name (or `false`) to the runtime filter value. */
export function toFilterValue(
  sphere: SphereNamespace,
  filter: FilterType | false
): FilterValue {
  if (filter === false) {
    return false;
  }
  return sphere.Filter[filter] ?? false;
}

/** Converts a runtime filter value back to its name (`"None"` when unset). */
export function fromFilterValue(
  sphere: SphereNamespace,
  value: unknown
): FilterType | undefined {
  return findEnumKey<FilterType>(sphere.Filter, value);
}

/** Resolves a UI mode name to the runtime `sphere.UiComponent` value. */
export function toUiComponentValue(
  sphere: SphereNamespace,
  mode: UiComponentMode
): UiComponentValue | undefined {
  if (mode === "None") {
    return false;
  }
  return sphere.UiComponent[mode];
}

/** Resolves a route mode name to its runtime letter code. */
export function toRouteModeValue(
  sphere: SphereNamespace,
  mode: RouteMode | undefined
): RouteModeValue | undefined {
  return mode === undefined ? undefined : sphere.RouteMode[mode];
}

/** Converts a runtime route mode code back to its name. */
export function fromRouteModeValue(
  sphere: SphereNamespace,
  value: unknown
): RouteMode | undefined {
  return findEnumKey<RouteMode>(sphere.RouteMode, value);
}

/** Resolves a route type name to its runtime bit flag. */
export function toRouteTypeValue(
  sphere: SphereNamespace,
  type: RouteType
): RouteTypeValue | undefined {
  return sphere.RouteType[type];
}

/** Resolves a route label name to its runtime value. */
export function toRouteLabelValue(
  sphere: SphereNamespace,
  label: RouteLabelType
): RouteLabelValue | undefined {
  if (label === "Hide") {
    return false;
  }
  return sphere.RouteLabel[label];
}

/** Converts a runtime route label value back to its name. */
export function fromRouteLabelValue(
  sphere: SphereNamespace,
  value: unknown
): RouteLabelType | undefined {
  return findEnumKey<RouteLabelType>(sphere.RouteLabel, value);
}

/** Resolves a route line part name to its runtime key. */
export function toRouteLineValue(
  sphere: SphereNamespace,
  line: RouteLineType
): RouteLineValue | undefined {
  return sphere.RouteLine[line];
}

/** Resolves a vehicle restriction name to its runtime value. */
export function toRouteRestrictValue(
  sphere: SphereNamespace,
  restrict: RouteRestrictType
): number | undefined {
  return sphere.RouteRestrict[restrict];
}
