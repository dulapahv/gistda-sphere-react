import { useEffect, useState } from "react";
import { useDeepMemo } from "@/internal/hooks";
import type { SuggestOptions, SuggestResult } from "@/types";
import { useSearch } from "./useSearch";

export interface UseSuggestOptions extends SuggestOptions {
  /** Milliseconds to wait after the keyword last changed. Default `250`. */
  debounce?: number;
  /** Shortest keyword (after trimming) to look up. Default `2`. */
  minLength?: number;
}

export interface UseSuggestReturn {
  /** Why the latest lookup failed, if it did. */
  error: Error | null;
  /** `true` from the keyword change until its suggestions arrive. */
  isLoading: boolean;
  /** Suggestions for the latest keyword, empty below `minLength`. */
  suggestions: SuggestResult[];
}

const IDLE: UseSuggestReturn = {
  error: null,
  isLoading: false,
  suggestions: [],
};

/**
 * Autocomplete suggestions for a keyword, for search boxes. Waits until the
 * keyword stops changing, and ignores responses for older keywords so slow
 * requests never overwrite newer suggestions. Results follow the map's
 * language. Works inside `SphereMap` and anywhere else under `SphereProvider`.
 */
export function useSuggest(
  keyword: string,
  options: UseSuggestOptions = {}
): UseSuggestReturn {
  const { suggest, isReady } = useSearch();
  const { debounce = 250, minLength = 2, ...suggestOptions } = options;
  const stableOptions = useDeepMemo(suggestOptions);
  const [state, setState] = useState<UseSuggestReturn>(IDLE);

  useEffect(() => {
    const text = keyword.trim();
    if (!isReady || text.length < minLength) {
      setState(IDLE);
      return;
    }
    let isCurrent = true;
    setState((previous) => ({ ...previous, isLoading: true }));
    const timer = setTimeout(async () => {
      try {
        const { data } = await suggest(text, stableOptions);
        if (isCurrent) {
          setState({ error: null, isLoading: false, suggestions: data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
            suggestions: [],
          });
        }
      }
    }, debounce);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [keyword, minLength, debounce, isReady, suggest, stableOptions]);

  return state;
}
