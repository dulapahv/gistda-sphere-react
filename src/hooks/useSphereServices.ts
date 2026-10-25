import { useMemo } from "react";
import { useSphereContext } from "@/context/SphereContext";
import { createSphereServices, type SphereServices } from "@/services/client";
import type { SphereServicesOptions } from "@/services/types";

/**
 * A REST web-services client using the provider's API key. Use it for
 * routing, geocoding, elevation, static maps, agriculture and disaster
 * data — no map required. Options override the provider defaults.
 */
export function useSphereServices(
  options: Omit<SphereServicesOptions, "apiKey"> = {}
): SphereServices {
  const { apiKey } = useSphereContext();
  const { baseUrl, fetch: fetchImpl, locale, method, timeout } = options;
  return useMemo(
    () =>
      createSphereServices({
        apiKey,
        baseUrl,
        fetch: fetchImpl,
        locale,
        method,
        timeout,
      }),
    [apiKey, baseUrl, fetchImpl, locale, method, timeout]
  );
}
