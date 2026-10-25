import { useMemo } from "react";
import { useSphereContext } from "@/context/SphereContext";
import { useDeepMemo } from "@/internal/hooks";
import { createSphereServices, type SphereServices } from "@/services/client";
import type { SphereServicesOptions } from "@/services/types";

/**
 * A REST web-services client using the provider's API key. Use it for
 * routing, geocoding, elevation, static maps, agriculture and disaster
 * data, with no map needed. Options override the provider defaults, and
 * `locale` defaults to `SphereProvider`'s `language`.
 */
export function useSphereServices(
  options: Omit<SphereServicesOptions, "apiKey"> = {}
): SphereServices {
  const { apiKey, language } = useSphereContext();
  const {
    baseUrl,
    fetch: fetchImpl,
    locale = language,
    method,
    referer,
    timeout,
  } = options;
  const headers = useDeepMemo(options.headers);
  return useMemo(
    () =>
      createSphereServices({
        apiKey,
        baseUrl,
        fetch: fetchImpl,
        headers,
        locale,
        method,
        referer,
        timeout,
      }),
    [apiKey, baseUrl, fetchImpl, headers, locale, method, referer, timeout]
  );
}
