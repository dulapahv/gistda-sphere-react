import { act, type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { SphereMap as SphereMapComponent } from "@/components/SphereMap";
import { SphereProvider, useSphereContext } from "@/context/SphereContext";
import type { SphereMap } from "@/types";

/**
 * Renders children inside `SphereProvider` + `SphereMap` and fires the mock
 * map's `ready` event so overlays mount immediately.
 */
export function renderInMap(
  mockMap: { _triggerReady: () => void },
  children: ReactNode
): RenderResult {
  const utils = render(
    <SphereProvider apiKey="test-key">
      <SphereMapComponent>{children}</SphereMapComponent>
    </SphereProvider>
  );
  act(() => {
    mockMap._triggerReady();
  });
  return utils;
}

/** Registers a (mock) map with the provider, as `SphereMap` does when ready. */
function MapRegistrar({ map }: { map: unknown }) {
  const { registerMap } = useSphereContext();
  useEffect(() => {
    registerMap(map as SphereMap);
  }, [map, registerMap]);
  return null;
}

/**
 * Wrapper rendering children inside `SphereProvider` with `map` registered
 * as the active map. Use with `renderHook(..., { wrapper })` for hooks that
 * work outside `SphereMap`.
 */
export function createProviderWrapper(map: unknown) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SphereProvider apiKey="test-key">
        <MapRegistrar map={map} />
        {children}
      </SphereProvider>
    );
  };
}
