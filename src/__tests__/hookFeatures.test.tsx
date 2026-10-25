import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useMapControls } from "@/context/SphereContext";
import { useMapEvent, useMapReady, useOverlayClick } from "@/hooks/useMapEvent";
import { useSearch } from "@/hooks/useSearch";
import { useSphereUtils } from "@/hooks/useSphereUtils";
import {
  resetTagCategoriesCache,
  useTagCategories,
} from "@/hooks/useTagCategories";
import { useTags } from "@/hooks/useTags";
import { useUi } from "@/hooks/useUi";
import { createProviderWrapper } from "./helpers";
import { createMockSphereApi } from "./setup";

const NO_SEARCH_DATA = /search service returned no data/;

describe("hook features", () => {
  const { mockSphere, mockMap } = createMockSphereApi();
  const map = mockMap as any;
  const wrapper = createProviderWrapper(mockMap);

  beforeEach(() => {
    // @ts-expect-error - partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("useMapEvent", () => {
    it("forwards every argument and the return value", () => {
      const handler = vi.fn().mockReturnValue(false);
      renderHook(() => useMapEvent("overlayClick", handler), { wrapper });

      const overlay = {};
      let result = true;
      act(() => {
        result = map.Event.fire("overlayClick", overlay, { lat: 1, lon: 2 });
      });
      expect(handler).toHaveBeenCalledWith(overlay, { lat: 1, lon: 2 });
      expect(result).toBe(false);
    });

    it("runs useMapReady once for an already-ready map", () => {
      const handler = vi.fn();
      const { rerender } = renderHook(() => useMapReady(handler), {
        wrapper,
      });
      rerender();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(mockMap);
    });

    it("delivers overlay clicks as an object to useOverlayClick", () => {
      const handler = vi.fn();
      renderHook(() => useOverlayClick(handler), { wrapper });
      const overlay = {};
      act(() => {
        map.Event.fire("overlayClick", overlay, { lat: 1, lon: 2 });
      });
      expect(handler).toHaveBeenCalledWith({
        location: { lat: 1, lon: 2 },
        overlay,
      });
    });
  });

  describe("useMapControls", () => {
    it("provides camera, layer and overlay controls", () => {
      const { result } = renderHook(() => useMapControls(), { wrapper });
      const controls = result.current;

      controls.zoomIn();
      controls.setZoomRange({ max: 18, min: 4 });
      controls.panBy({ x: 0, y: 50 }, false);
      controls.addLayer("TRAFFIC");
      controls.addLayer("https://example.com/style.json", "labels");
      controls.removeLayer("TRAFFIC");
      controls.setBaseLayer("HYBRID");
      controls.clearLayers();
      controls.loadPredefinedOverlay("events", { refresh: 60 });
      controls.unloadPredefinedOverlay("events");

      expect(mockMap.zoom).toHaveBeenCalledWith(true, true);
      expect(mockMap.zoomRange).toHaveBeenCalledWith({ max: 18, min: 4 });
      expect(mockMap.move).toHaveBeenCalledWith({ x: 0, y: 50 }, false);
      expect(mockMap.Layers.add).toHaveBeenCalledWith(
        mockSphere.Layers.TRAFFIC,
        undefined
      );
      expect(mockSphere.Layer).toHaveBeenCalledWith(
        "https://example.com/style.json"
      );
      expect(mockMap.Layers.remove).toHaveBeenCalledWith(
        mockSphere.Layers.TRAFFIC
      );
      expect(mockMap.Layers.setBase).toHaveBeenCalledWith(
        mockSphere.Layers.HYBRID
      );
      expect(mockMap.Layers.clear).toHaveBeenCalled();
      expect((mockSphere.Overlays.events as { refresh?: number }).refresh).toBe(
        60
      );
      expect(mockMap.Overlays.load).toHaveBeenCalledWith(
        mockSphere.Overlays.events
      );
      expect(mockMap.Overlays.unload).toHaveBeenCalledWith(
        mockSphere.Overlays.events
      );
    });

    it("removes a layer added by style URL using the same URL", () => {
      const { result } = renderHook(() => useMapControls(), { wrapper });
      const url = "https://example.com/flood.json";

      result.current.addLayer(url);
      const layer = mockMap.Layers.add.mock.calls.at(-1)?.[0];
      result.current.removeLayer(url);

      expect(mockSphere.Layer).toHaveBeenCalledWith(url);
      expect(mockMap.Layers.remove).toHaveBeenCalledWith(layer);
    });

    it("reads map state", () => {
      mockMap.enableFilter.mockImplementation((value?: unknown) =>
        value === undefined ? "DARK" : mockMap
      );
      mockMap.zoomRange.mockImplementation((value?: unknown) =>
        value === undefined ? { max: 20, min: 1 } : mockMap
      );
      mockMap.bound.mockImplementation((value?: unknown) =>
        value === undefined
          ? { maxLat: 2, maxLon: 2, minLat: 1, minLon: 1 }
          : mockMap
      );
      const { result } = renderHook(() => useMapControls(), { wrapper });
      expect(result.current.getCenter()).toEqual({ lat: 13.75, lon: 100.5 });
      expect(result.current.getZoom()).toBe(10);
      expect(result.current.getFilter()).toBe("Dark");
      expect(result.current.getZoomRange()).toEqual({ max: 20, min: 1 });
      expect(result.current.getBound()).toEqual({
        maxLat: 2,
        maxLon: 2,
        minLat: 1,
        minLon: 1,
      });
      expect(result.current.getLanguage()).toBe("th");
      expect(result.current.getLayers()).toEqual([]);
      expect(result.current.getRotate()).toBe(0);
      expect(result.current.getPitch()).toBe(0);
    });
  });

  describe("useUi", () => {
    it("controls built-in UI and input", () => {
      const { result } = renderHook(() => useUi(), { wrapper });
      const ui = result.current;

      ui.setControlVisible("Scale", false);
      ui.locateUser();
      ui.clearUserLocation();
      ui.setKeyboardEnabled(false);
      ui.setMouseEnabled({ wheel: false });
      ui.setMouseEnabled(true);
      ui.setContextMenuOptions({ address: false, nearPoi: true });
      ui.setLanguage("en");

      expect(mockMap.Ui.Scale.visible).toHaveBeenCalledWith(false);
      expect(mockMap.Ui.Geolocation.trigger).toHaveBeenCalled();
      expect(mockMap.Ui.Geolocation.removeMarker).toHaveBeenCalled();
      expect(mockMap.Ui.Keyboard.enable).toHaveBeenCalledWith(false);
      expect(mockMap.Ui.Mouse.enableWheel).toHaveBeenCalledWith(false);
      expect(mockMap.Ui.Mouse.enable).toHaveBeenCalledWith(true);
      expect(mockMap.Ui.ContextMenu.enableAddress).toHaveBeenCalledWith(false);
      expect(mockMap.Ui.ContextMenu.enableNearPoi).toHaveBeenCalledWith(true);
      expect(mockMap.Ui.language).toHaveBeenCalledWith("en");
      expect(ui.isControlVisible("Scale")).toBe(true);
      expect(ui.isKeyboardEnabled()).toBe(true);
      expect(ui.getMouseState()).toEqual({
        click: true,
        drag: true,
        wheel: true,
      });
      expect(ui.getContextMenuOptions()).toEqual({
        address: true,
        nearPoi: true,
      });
    });

    it("locks the map once and controls the lock", () => {
      const placeholder = mockMap.placeholder();
      mockMap.Ui.lockMap.mockImplementation((options) => {
        const overlay = document.createElement("div");
        overlay.className = "sphere-lock";
        const button = document.createElement("button");
        button.addEventListener("click", () => {
          const locked = overlay.style.display !== "none";
          overlay.style.display = locked ? "none" : "block";
          button.textContent = locked
            ? options.onLockLabel
            : options.onUnlockLabel;
        });
        placeholder.append(overlay, button);
      });
      const { result } = renderHook(() => useUi(), { wrapper });

      const lock = result.current.lockMap({ unlockLabel: "Tap to use" });
      expect(mockMap.Ui.lockMap).toHaveBeenCalledWith(
        expect.objectContaining({
          lockButtonClassName: "sphere-react-lock-button",
          onUnlockLabel: "Tap to use",
        })
      );
      expect(result.current.lockMap()).toBe(lock);
      expect(lock?.isLocked()).toBe(true);
      lock?.unlock();
      expect(lock?.isLocked()).toBe(false);
      lock?.lock();
      expect(lock?.isLocked()).toBe(true);
      lock?.remove();
      expect(placeholder.querySelector(".sphere-lock")).toBeNull();
      expect(document.getElementById("sphere-react-lock-style")).not.toBeNull();
    });
  });

  describe("useSearch", () => {
    beforeEach(() => {
      map.Search = {
        address: vi.fn().mockResolvedValue(null),
        clear: vi.fn(),
        enablePopup: vi.fn().mockReturnValue(true),
        language: vi.fn().mockReturnValue("en"),
        nearPoi: vi.fn().mockResolvedValue({ data: [{ id: "1" }], meta: {} }),
        placeholder: vi.fn(),
        search: vi.fn().mockResolvedValue(null),
        suggest: vi.fn().mockResolvedValue({ data: [], meta: {} }),
      };
    });

    it("returns typed results and explains empty responses", async () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      await expect(result.current.nearPoi({ lat: 1, lon: 2 })).resolves.toEqual(
        [{ id: "1" }]
      );
      await expect(
        result.current.address({ lat: 1, lon: 2 })
      ).resolves.toBeNull();
      await expect(result.current.search("x")).rejects.toThrow(NO_SEARCH_DATA);
      await expect(result.current.suggest("x")).resolves.toEqual({
        data: [],
        meta: {},
      });
    });

    it("exposes the result list placeholder and getters", () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const element = document.createElement("div");
      result.current.setPlaceholder(element, { icon: false });
      expect(map.Search.placeholder).toHaveBeenCalledWith(element, {
        icon: false,
      });
      expect(result.current.getLanguage()).toBe("en");
      expect(result.current.isPopupEnabled()).toBe(true);
    });
  });

  describe("useTags", () => {
    it("exposes language and popup getters", () => {
      map.Tags = {
        enablePopup: vi.fn().mockReturnValue(false),
        language: vi.fn().mockReturnValue("th"),
      };
      const { result } = renderHook(() => useTags(), { wrapper });
      expect(result.current.getLanguage()).toBe("th");
      expect(result.current.isPopupEnabled()).toBe(false);
    });
  });

  describe("useTagCategories", () => {
    const categories = [
      {
        icon: "bank",
        name: { en: "Bank/ATM", th: "ธนาคาร/เอทีเอ็ม" },
        sub: [{ icon: "bank", name: { en: "Bank", th: "ธนาคาร" } }],
      },
    ];

    beforeEach(() => {
      resetTagCategoriesCache();
    });

    it("loads and localizes the live category list", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(categories), { status: 200 })
        );
      vi.stubGlobal("fetch", fetchMock);

      const { result } = renderHook(() => useTagCategories("en"), { wrapper });
      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.categories).toEqual([
        {
          icon: "bank",
          name: "Bank/ATM",
          tags: [{ id: "ธนาคาร", label: "Bank" }],
        },
      ]);
      expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
        "https://api.sphere.gistda.or.th/services/category/all"
      );
    });

    it("keeps each tag ID once per category", async () => {
      const repeated = [
        {
          icon: "education",
          name: { en: "Education", th: "การศึกษา" },
          sub: [
            {
              icon: "education",
              name: { en: "School Unclassified", th: "การศึกษาอื่น ๆ" },
            },
            {
              icon: "education",
              name: { en: "Education Others", th: "การศึกษาอื่น ๆ" },
            },
          ],
        },
      ];
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify(repeated), { status: 200 })
          )
      );
      const { result } = renderHook(() => useTagCategories("en"), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.categories[0]?.tags).toEqual([
        { id: "การศึกษาอื่น ๆ", label: "School Unclassified" },
      ]);
    });

    it("reports errors", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("oops", { status: 500 }))
      );
      const { result } = renderHook(() => useTagCategories(), { wrapper });
      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.categories).toEqual([]);
    });
  });

  describe("useSphereUtils", () => {
    it("loads converter libraries automatically", async () => {
      const { result } = renderHook(() => useSphereUtils(), { wrapper });
      await expect(
        result.current.wktToGeoJSON("POINT(100 13)")
      ).resolves.toEqual({
        coordinates: [100, 13],
        type: "Point",
      });
      expect(mockSphere.Util.initLibrary).toHaveBeenCalledWith("wkt");

      await result.current.kmlToGeoJSON("<kml></kml>");
      expect(mockSphere.Util.initLibrary).toHaveBeenCalledWith("kml");
      expect(mockSphere.Util.KMLToGeoJSON?.mock.calls[0]?.[0]).toBeInstanceOf(
        Document
      );

      await result.current.project("+proj=utm +zone=47", [100, 13]);
      expect(mockSphere.Util.project).toHaveBeenCalledWith(
        "+proj=utm +zone=47",
        [100, 13]
      );
      await result.current.project("EPSG:32647", [1, 2], "EPSG:4326");
      expect(mockSphere.Util.project).toHaveBeenCalledWith(
        "EPSG:4326",
        "EPSG:32647",
        [1, 2]
      );
    });

    it("formats using the map language by default", () => {
      const { result } = renderHook(() => useSphereUtils(), { wrapper });
      expect(result.current.formatDistance(1200)).toBe("1200 m th");
      expect(result.current.formatArea(5, "en")).toBe("5 m2 en");
      expect(result.current.isReady).toBe(true);
    });
  });

  describe("SphereProvider POI hooks", () => {
    it("installs and restores formatPoi and poiPopupOptions", async () => {
      const formatPoi = vi.fn(() => document.createElement("section"));
      const poiPopupOptions = vi.fn(() => ({ title: "Custom" }));
      const { unmount } = render(
        <SphereProvider
          apiKey="test-key"
          formatPoi={formatPoi}
          poiPopupOptions={poiPopupOptions}
        >
          {null}
        </SphereProvider>
      );

      await waitFor(() => expect(mockSphere.Util.formatPoi).toBeDefined());
      const util = mockSphere.Util as unknown as {
        formatPoi: (poi: object, lang: string) => HTMLElement;
        poiPopupOptions: (...args: string[]) => object;
      };
      expect(util.formatPoi({ id: "1" }, "th").tagName).toBe("SECTION");
      expect(util.poiPopupOptions("src", "id", "name", "en")).toEqual({
        title: "Custom",
      });

      unmount();
      expect(mockSphere.Util.formatPoi).toBeUndefined();
      expect(mockSphere.Util.poiPopupOptions).toBeUndefined();
    });
  });
});
