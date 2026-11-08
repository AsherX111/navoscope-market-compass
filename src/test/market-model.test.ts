import { describe, expect, it } from "vitest";
import {
  catalogMarkets,
  domelMarkets,
  legacyMarkets,
  criteria,
  defaultScores,
  generateAnalysis,
  markets,
  recommendation,
  searchMarkets,
  weightedScore,
} from "@/lib/market/model";

describe("opportunity scoring", () => {
  it("matches the public illustrative demand contribution of 30 points", () => {
    const demand = criteria.find(({ key }) => key === "demand");
    expect(demand?.weight).toBe(0.3);
    expect((5 / 5) * (demand?.weight ?? 0) * 100).toBe(30);
  });
  it("matches the public example's other four ratings at 3/5 contributing 42 points", () => {
    const others = criteria.filter(({ key }) => key !== "demand");
    expect(others).toHaveLength(4);
    expect(others.reduce((sum, { weight }) => sum + weight, 0)).toBeCloseTo(0.7);
    expect(others.reduce((sum, { weight }) => sum + (3 / 5) * weight * 100, 0)).toBeCloseTo(42);
  });
  it("keeps the public illustrative total at 72 out of 100", () => {
    expect(weightedScore({ demand: 5, growth: 3, fit: 3, feasibility: 3, resilience: 3 })).toBe(72);
  });
  it("keeps the default 20 and legacy six-opportunity catalog and five-rating model accurate", () => {
    expect(catalogMarkets()).toHaveLength(20);
    expect(legacyMarkets).toHaveLength(6);
    expect(markets).toHaveLength(26);
    expect(criteria).toHaveLength(5);
  });
  it("uses documented weights, boundaries and changed inputs", () => {
    expect(criteria.reduce((n, c) => n + c.weight, 0)).toBe(1);
    expect(weightedScore({ demand: 1, growth: 1, fit: 1, feasibility: 1, resilience: 1 })).toBe(20);
    expect(weightedScore({ demand: 5, growth: 5, fit: 5, feasibility: 5, resilience: 5 })).toBe(
      100,
    );
    expect(weightedScore(defaultScores)).toBe(60);
    expect(weightedScore({ ...defaultScores, demand: 5 })).toBe(72);
  });
  it.each([0, 6, 2.5, NaN, Infinity])("rejects invalid rating %s", (demand) => {
    expect(() => weightedScore({ ...defaultScores, demand })).toThrow();
  });
  it("prioritises risk and feasibility over a high aggregate", () => {
    expect(
      recommendation({ demand: 5, growth: 5, fit: 5, feasibility: 5, resilience: 2 }).category,
    ).toBe("Protect");
    expect(
      recommendation({ demand: 5, growth: 5, fit: 5, feasibility: 2, resilience: 5 }).category,
    ).toBe("Protect");
    expect(
      recommendation({ demand: 4, growth: 4, fit: 4, feasibility: 4, resilience: 4 }).category,
    ).toBe("Prioritise");
    expect(recommendation(defaultScores).category).toBe("Expand");
    expect(recommendation({ ...defaultScores, demand: 1 }).category).toBe("Monitor");
  });
});
describe("market discovery", () => {
  it("combines case-insensitive keywords, industry, region and growth", () => {
    expect(
      searchMarkets({
        catalog: "legacy",
        query: "COOLING",
        industry: "Energy",
        region: "Asia Pacific",
        minGrowth: 15,
        sort: "growth",
      }).map((m) => m.id),
    ).toEqual(["asia-cooling"]);
    expect(
      searchMarkets({
        query: "no such market",
        industry: "",
        region: "",
        minGrowth: 0,
        sort: "size",
      }),
    ).toEqual([]);
  });
  it("sorts numeric metrics and does not mutate the catalog", () => {
    const ids = markets.map((m) => m.id);
    expect(
      searchMarkets({
        query: "",
        industry: "",
        region: "",
        minGrowth: 0,
        sort: "size",
        catalog: "legacy",
      })[0]?.id,
    ).toBe("na-automation");
    expect(
      searchMarkets({
        query: "",
        industry: "",
        region: "",
        minGrowth: 0,
        sort: "growth",
        catalog: "legacy",
      })[0]?.id,
    ).toBe("asia-cooling");
    expect(markets.map((m) => m.id)).toEqual(ids);
  });
});
describe("rule-based analysis", () => {
  it("records assumptions and rating-dependent recommendations without claiming AI", () => {
    const report = generateAnalysis(
      domelMarkets[0] as NonNullable<(typeof domelMarkets)[0]>,
      { ...defaultScores, resilience: 1 },
      "Limited pilot budget",
    );
    expect(report.mode).toContain("no language model called");
    expect(report.summary).toContain("AGV transport drives");
    expect(report.assumptions).toBe("Limited pilot budget");
    expect(report.category).toBe("Protect");
    expect(report.risks.join(" ")).toContain("Risk resilience");
    expect(report.gaps.join(" ")).toContain("Not verified market research");
    expect(report.actions.length).toBeGreaterThan(2);
  });
  it("requires nonempty bounded assumptions", () => {
    expect(() =>
      generateAnalysis(
        domelMarkets[0] as NonNullable<(typeof domelMarkets)[0]>,
        defaultScores,
        "  ",
      ),
    ).toThrow();
    expect(() =>
      generateAnalysis(
        domelMarkets[0] as NonNullable<(typeof domelMarkets)[0]>,
        defaultScores,
        "a".repeat(3001),
      ),
    ).toThrow();
  });
});

describe("Domel evidence catalog", () => {
  const options = { query: "", industry: "", region: "", minGrowth: 0, sort: "name" };
  it("preserves every legacy ID", () => {
    expect(legacyMarkets.map((m) => m.id)).toEqual([
      "eu-heat-pumps",
      "asia-water",
      "na-automation",
      "eu-medical",
      "asia-cooling",
      "na-recycling",
    ]);
    expect(new Set(markets.map((m) => m.id)).size).toBe(26);
  });
  it("includes unknown growth with Any growth and excludes it at positive thresholds", () => {
    expect(searchMarkets(options)).toHaveLength(20);
    expect(domelMarkets.every((m) => m.size === null && m.growth === null)).toBe(true);
    expect(searchMarkets({ ...options, minGrowth: 10 })).toHaveLength(0);
    expect(
      searchMarkets({ ...options, catalog: "all", minGrowth: 10 })
        .map((m) => m.id)
        .sort(),
    ).toEqual(["asia-cooling", "eu-heat-pumps", "na-recycling"]);
  });
  it.each(["size", "growth"])(
    "puts unknown %s after all six known illustrative metrics",
    (sort) => {
      const result = searchMarkets({ ...options, sort, catalog: "all" });
      expect(result.slice(0, 6).every((m) => !m.id.startsWith("domel-"))).toBe(true);
      expect(result.slice(6).every((m) => m.id.startsWith("domel-"))).toBe(true);
    },
  );
  it("searches source title, publisher and applications", () => {
    expect(searchMarkets({ ...options, query: "Domel" })).toHaveLength(20);
    expect(searchMarkets({ ...options, query: "China Clean Expo" })).toHaveLength(4);
    expect(searchMarkets({ ...options, query: "recirculation" }).map((m) => m.id)).toEqual([
      "domel-hydrogen",
    ]);
  });
  it("snapshots dates and sources without invented size, growth or commercial claims", () => {
    for (const market of domelMarkets) {
      const report = generateAnalysis(market, defaultScores, "Demand unverified");
      expect(report.sources).toEqual(market.sources);
      expect(report.sources).not.toBe(market.sources);
      expect(report.sources?.[0]?.accessedDate).toBe("2026-11-08");
      expect(report.summary).toContain("Size: Not established; annual growth: Not established");
      expect(report.summary).not.toMatch(/null|USD|\d+%/);
      expect(report.applicability).toContain("separate from user-rated attractiveness");
      expect(report.mode).toBe("Rule-based demo — no language model called");
    }
    expect(domelMarkets.find((m) => m.id === "domel-agv")?.sources?.[0]?.publicationDate).toBe(
      "2026-07-03",
    );
    expect(domelMarkets.find((m) => m.id === "domel-vacuum")?.sources?.[0]?.eventDates).toBe(
      "2024-03-26 to 2024-03-29",
    );
  });
});
