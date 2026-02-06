import { useSphereContext } from "../context/SphereContext";
import type { SphereNamespace } from "../types";

export function useSphere(): {
  sphere: SphereNamespace | null;
  isLoaded: boolean;
  error: Error | null;
  apiKey: string;
} {
  const { sphere, isLoaded, error, apiKey } = useSphereContext();

  return {
    sphere,
    isLoaded,
    error,
    apiKey,
  };
}
