import { afterEach, describe, expect, it, vi } from "vitest";
import { createSphereServices, SphereServiceError } from "@/services/client";

const BASE = "https://api.sphere.gistda.or.th/services";
const location = { lat: 13.75, lon: 100.5 };
const API_KEY_REQUIRED = /apiKey/;
const ENABLE_SERVICE_HINT = /Enable this service for your key/;

/** A client whose fetch records requested URLs and returns `body`. */
function clientReturning(body: unknown, status = 200) {
  const fetchMock = vi.fn(
    async (_url: string) =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
      })
  );
  const client = createSphereServices({
    apiKey: "KEY",
    fetch: fetchMock as unknown as typeof fetch,
  });
  const requested = () => new URL(String(fetchMock.mock.calls.at(-1)?.[0]));
  return { client, fetchMock, requested };
}

/** Query parameters of a URL as `[key, value]` pairs (keeps repeats). */
function params(url: URL) {
  return [...url.searchParams.entries()];
}

describe("createSphereServices", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires an API key", () => {
    expect(() => createSphereServices({ apiKey: "" })).toThrow(
      API_KEY_REQUIRED
    );
  });

  describe("requests", () => {
    it("search & suggest", async () => {
      const { client, requested } = clientReturning({ data: [] });

      await client.search.suggest("วัด", { limit: 5, soundex: true });
      expect(requested().pathname).toBe("/services/search/suggest");
      expect(params(requested())).toEqual([
        ["keyword", "วัด"],
        ["limit", "5"],
        ["sdx", "true"],
        ["key", "KEY"],
      ]);

      await client.search.search("cafe", {
        near: location,
        showDistance: true,
        tag: ["อาหาร", "โรงแรม"],
      });
      expect(Object.fromEntries(params(requested()))).toEqual({
        key: "KEY",
        keyword: "cafe",
        lat: "13.75",
        locale: "th",
        lon: "100.5",
        showdistance: "true",
        tag: "อาหาร,โรงแรม",
      });
    });

    it("POI lookups", async () => {
      const { client, requested } = clientReturning({ data: [] });

      await client.poi.nearby(location, {
        limit: 3,
        locale: "en",
        span: "1km",
      });
      expect(requested().pathname).toBe("/services/poi/search");
      expect(requested().searchParams.get("span")).toBe("1km");
      expect(requested().searchParams.get("locale")).toBe("en");

      await client.poi.get("A10000000");
      expect(requested().pathname).toBe("/services/poi/get");
      expect(requested().searchParams.get("id")).toBe("A10000000");

      await client.poi.cluster({ x: 1, y: 2, z: 3 }, { tag: "เอทีเอ็ม" });
      expect(requested().pathname).toBe("/services/poi/cluster/3/1/2/th");
      expect(requested().searchParams.get("tag[0]")).toBe("เอทีเอ็ม");
      expect(requested().searchParams.has("tag")).toBe(false);

      await client.poi.cluster(
        { x: 1, y: 2, z: 3 },
        { tag: ["โรงพยาบาล", "วัด"] }
      );
      expect(requested().searchParams.get("tag[1]")).toBe("วัด");
    });

    it("routing with mode, types and vehicle", async () => {
      const { client, requested } = clientReturning({ data: {}, features: [] });

      await client.route.route({
        from: location,
        guide: "turns",
        mode: "Distance",
        to: { lat: 14, lon: 101 },
        types: ["Road", "Tollway", "Road"],
        vehicle: "motorcycle",
      });
      expect(Object.fromEntries(params(requested()))).toEqual({
        flat: "13.75",
        flon: "100.5",
        guide: "n",
        key: "KEY",
        locale: "th",
        mode: "d",
        restrict: "1",
        tlat: "14",
        tlon: "101",
        type: "17",
      });
    });

    it("route matrix with repeated coordinates", async () => {
      const { client, requested } = clientReturning({ data: [] });
      await client.route.matrix({
        from: [location, { lat: 14, lon: 101 }],
        mode: "Traffic",
        to: [{ lat: 15, lon: 102 }],
      });
      expect(requested().searchParams.getAll("flon")).toEqual(["100.5", "101"]);
      expect(requested().searchParams.getAll("tlat")).toEqual(["15"]);
      expect(requested().searchParams.get("mode")).toBe("t");
    });

    it("geo services accept locations or geometries", async () => {
      const { client, requested } = clientReturning([]);
      await client.geo.address(location, { locale: "en" });
      expect(requested().pathname).toBe("/services/geo/address");
      expect(requested().searchParams.get("locale")).toBe("en");

      const line = {
        coordinates: [
          [100, 13],
          [101, 14],
        ],
        type: "LineString" as const,
      };
      await client.geo.elevation(line);
      expect(JSON.parse(requested().searchParams.get("geo") ?? "")).toEqual(
        line
      );
      await client.geo.elevation(location);
      expect(requested().searchParams.get("lat")).toBe("13.75");
    });

    it("information services", async () => {
      const { client, requested } = clientReturning([]);
      const polygon = {
        coordinates: [
          [
            [100, 13],
            [101, 13],
            [100, 14],
            [100, 13],
          ],
        ],
        type: "Polygon" as const,
      };

      await client.info.crop(location, { from: "2024-01-01" });
      expect(requested().pathname).toBe("/services/info/crop");
      expect(requested().searchParams.get("from")).toBe("2024-01-01");

      await client.info.cropSuitability(polygon);
      expect(requested().searchParams.has("geom")).toBe(true);

      await client.info.landSuitability(location);
      expect(requested().pathname).toBe("/services/info/land-suitability");

      await client.info.flood(location, { to: "2024-02-01" });
      expect(requested().pathname).toBe("/services/info/disaster-flood");

      await client.info.drought(location);
      expect(requested().pathname).toBe("/services/info/disaster-drought");

      await client.info.hotspot({
        district: "เชียงดาว",
        province: "เชียงใหม่",
        subdistrict: "เมืองนะ",
      });
      expect(Object.fromEntries(params(requested()))).toMatchObject({
        ap_tn: "เชียงดาว",
        pv_tn: "เชียงใหม่",
        tb_tn: "เมืองนะ",
      });

      await client.info.disasterRecurring(location, {
        types: ["flood", "drought"],
        version: 2,
      });
      expect(requested().pathname).toBe("/services/info/disaster-recurring/v2");
      expect(requested().searchParams.get("disaster_type")).toBe(
        "flood,drought"
      );

      await client.info.floodRecurrence(polygon);
      expect(requested().pathname).toBe(
        "/services/info/disasters/flood-recurrence"
      );
      await client.info.droughtRecurrence(location);
      expect(requested().pathname).toBe(
        "/services/info/disasters/drought-recurrence"
      );
    });

    it("agriculture and population services", async () => {
      const { client, fetchMock, requested } = clientReturning({});
      await client.agri.rubber(location, { year: 2023 });
      expect(requested().pathname).toBe("/services/agri/rubber-yearly-50m");
      expect(requested().searchParams.get("year")).toBe("2023");
      const crops = ["palm", "rice", "sugarcane", "maize", "cassava"] as const;
      await Promise.all(crops.map((crop) => client.agri[crop](location)));
      const paths = fetchMock.mock.calls.map(([url]) => new URL(url).pathname);
      for (const crop of crops) {
        expect(paths.some((path) => path.includes(`/agri/${crop}-`))).toBe(
          true
        );
      }
      await client.population.get("POLYGON((100 13,101 13,101 14,100 13))", {
        year: 2020,
      });
      expect(requested().pathname).toBe("/services/population/facebook");
      expect(requested().searchParams.get("year")).toBe("2020");
    });

    it("loads tag categories without a key", async () => {
      const { client, requested } = clientReturning([]);
      await client.tags.categories();
      expect(requested().toString()).toBe(`${BASE}/category/all`);
    });
  });

  describe("request method", () => {
    /** A client whose fetch records every call. */
    function recordingClient(method?: "auto" | "get" | "post") {
      const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
        Response.json({ data: [] })
      );
      const client = createSphereServices({
        apiKey: "KEY",
        fetch: fetchMock as unknown as typeof fetch,
        method,
      });
      return { client, fetchMock };
    }

    it("uses GET for normal requests", async () => {
      const { client, fetchMock } = recordingClient();
      await client.search.search("cafe");
      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toContain("/services/search/search?keyword=cafe");
      expect(init?.method).toBeUndefined();
    });

    it("switches to a form POST when the URL would be too long", async () => {
      const { client, fetchMock } = recordingClient();
      const ring = Array.from(
        { length: 200 },
        (_, index) => `${100 + index / 1000} 13.5`
      ).join(",");
      const wkt = `POLYGON((${ring}))`;
      await client.population.get(wkt, { year: 2020 });

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe(`${BASE}/population/facebook`);
      expect(init?.method).toBe("POST");
      const body = init?.body as URLSearchParams;
      expect(body.get("wkt")).toBe(wkt);
      expect(body.get("year")).toBe("2020");
      expect(body.get("key")).toBe("KEY");
    });

    it("can always POST, keeping repeated keys", async () => {
      const { client, fetchMock } = recordingClient("post");
      await client.route.matrix({
        from: [location, { lat: 14, lon: 101 }],
        to: [{ lat: 15, lon: 102 }],
      });
      const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
      expect(body.getAll("flon")).toEqual(["100.5", "101"]);
    });

    it("can always GET", async () => {
      const { client, fetchMock } = recordingClient("get");
      await client.population.get(`POLYGON((${"100 13,".repeat(500)}100 13))`);
      expect(fetchMock.mock.calls[0]?.[1]?.method).toBeUndefined();
    });
  });

  describe("URL builders", () => {
    const { client } = clientReturning({});

    it("builds static and embed map URLs", () => {
      const staticUrl = new URL(
        client.maps.staticMapUrl({
          center: location,
          features: [
            {
              geometry: { coordinates: [100.5, 13.75], type: "Point" },
              properties: { linecolor: "red", text: "Here" },
              type: "Feature",
            },
          ],
          height: 300,
          width: 400,
          zoom: 12,
        })
      );
      expect(staticUrl.pathname).toBe("/services/snippet/static");
      expect(staticUrl.searchParams.get("map")).toBe("sphere_streets");
      expect(JSON.parse(staticUrl.searchParams.get("geo") ?? "").type).toBe(
        "FeatureCollection"
      );

      const embed = new URL(
        client.maps.embedUrl({ center: location, marker: true, zoom: 14 })
      );
      expect(embed.pathname).toBe("/services/snippet/embed");
      expect(embed.searchParams.get("marker")).toBe("true");
    });

    it("builds tile and style URLs", () => {
      expect(client.maps.rasterTileUrl("thailand_images")).toBe(
        "https://basemap.sphere.gistda.or.th/tiles/thailand_images/EPSG3857/{z}/{x}/{y}.jpeg?key=KEY"
      );
      expect(client.maps.vectorTileUrl()).toContain(
        "/maps/sphere/{z}/{x}/{y}.pbf"
      );
      expect(client.maps.vectorStyleUrl("hybrid")).toBe(
        "https://basemap.sphere.gistda.or.th/vector/sphere_hybrid.json"
      );
      expect(client.maps.wmtsCapabilitiesUrl()).toBe(
        "https://basemap.sphere.gistda.or.th/service?key=KEY"
      );
    });
  });

  describe("errors", () => {
    it("explains rejected API keys (returned with HTTP 200)", async () => {
      const { client } = clientReturning("sphere Map API key error");
      const error = await client.route
        .route({ from: location, to: location })
        .catch((reason: unknown) => reason);
      expect(error).toBeInstanceOf(SphereServiceError);
      expect(error).toMatchObject({
        code: "key",
        service: "route/route",
        status: 200,
      });
      expect((error as Error).message).toMatch(ENABLE_SERVICE_HINT);
    });

    it("reports HTTP errors and unparseable bodies", async () => {
      await expect(
        clientReturning("Bad gateway", 502).client.geo.address(location)
      ).rejects.toMatchObject({ code: "http", status: 502 });
      await expect(
        clientReturning("<html>").client.geo.address(location)
      ).rejects.toMatchObject({ code: "parse" });
    });

    it("times out and honors caller aborts", async () => {
      const hanging = vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            );
          })
      );
      const client = createSphereServices({
        apiKey: "KEY",
        fetch: hanging as unknown as typeof fetch,
        timeout: 20,
      });

      await expect(client.geo.address(location)).rejects.toMatchObject({
        code: "timeout",
      });

      const controller = new AbortController();
      const pending = client.geo.address(location, {
        signal: controller.signal,
        timeout: 0,
      });
      controller.abort();
      await expect(pending).rejects.toMatchObject({ code: "aborted" });
    });

    it("reports network failures", async () => {
      const client = createSphereServices({
        apiKey: "KEY",
        fetch: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
      });
      await expect(client.geo.address(location)).rejects.toMatchObject({
        code: "network",
      });
    });
  });
});
