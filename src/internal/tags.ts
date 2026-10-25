import type { SphereMap } from "@/types";

/**
 * Removes tags added together as `"a|b"`: Sphere adds each name separately
 * but `Tags.remove("a|b")` only looks for the combined name.
 */
export function removeTags(map: SphereMap, name: string): void {
  for (const tag of name.split("|")) {
    map.Tags.remove(tag);
  }
}
